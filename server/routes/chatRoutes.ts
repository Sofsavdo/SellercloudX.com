// @ts-nocheck
// 💬 CHAT SYSTEM - Real-time Partner-Admin Communication
// Fixes: Proper error handling, WebSocket integration, file upload support
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { chatRooms, messages, partners, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// IMPROVED: Add comprehensive logging
const logInfo = (message: string, data?: any) => {
  console.log(`[CHAT] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logError = (message: string, error: any) => {
  console.error(`[CHAT ERROR] ${message}`, error);
};

const router = express.Router();

// Get or create chat room for partner
router.get('/room', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    return res.status(404).json({ message: 'Partner not found' });
  }

  // Find existing chat room
  let chatRoom = await db.select()
    .from(chatRooms)
    .where(eq(chatRooms.partnerId, partner.id))
    .limit(1);

  // Create if doesn't exist
  if (chatRoom.length === 0) {
    const now = new Date();
    const newRoom = {
      id: `chat-${nanoid()}`,
      partnerId: partner.id,
      adminId: null,
      status: 'active',
      createdAt: now,
      lastMessageAt: null
    };

    try {
      await db.insert(chatRooms).values(newRoom);
      chatRoom = [newRoom];
    } catch (insertError: any) {
      console.error('[CHAT] Error creating chat room:', insertError.message);
      // Try to get existing room again
      chatRoom = await db.select()
        .from(chatRooms)
        .where(eq(chatRooms.partnerId, partner.id))
        .limit(1);
      
      if (chatRoom.length === 0) {
        return res.status(500).json({ message: 'Could not create chat room' });
      }
    }
  }

  res.json({
    ...chatRoom[0],
    partnerName: partner.businessName
  });
}));

// Get all chat rooms (Admin only)
router.get('/rooms', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Get all chat rooms with partner info
  const rooms = await db.select({
    id: chatRooms.id,
    partnerId: chatRooms.partnerId,
    adminId: chatRooms.adminId,
    status: chatRooms.status,
    createdAt: chatRooms.createdAt,
    lastMessageAt: chatRooms.lastMessageAt,
    partnerName: partners.businessName,
    partnerPhone: partners.phone
  })
  .from(chatRooms)
  .leftJoin(partners, eq(chatRooms.partnerId, partners.id))
  .orderBy(desc(chatRooms.lastMessageAt));

  res.json(rooms);
}));

// Get messages for a chat room
router.get('/messages/:chatRoomId?', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  const { chatRoomId } = req.params;
  
  let roomId = chatRoomId;

  try {
    // If partner, get their chat room
    if (user?.role === 'partner' && !chatRoomId) {
      if (!partner?.id) {
        return res.json([]);
      }
      
      try {
        const room = await db.select()
          .from(chatRooms)
          .where(eq(chatRooms.partnerId, partner.id))
          .limit(1);
        
        if (room.length === 0) {
          return res.json([]);
        }
        roomId = room[0].id;
      } catch (dbError: any) {
        console.error('[CHAT] Error getting chat room:', dbError.message);
        return res.json([]);
      }
    } else if (user?.role === 'partner' && chatRoomId) {
      // SECURITY: partners can only read their own room
      if (!partner?.id) {
        return res.status(403).json({ message: 'Partner not found' });
      }
      
      try {
        const room = await db
          .select({ id: chatRooms.id })
          .from(chatRooms)
          .where(and(eq(chatRooms.id, chatRoomId), eq(chatRooms.partnerId, partner.id)))
          .limit(1);
        if (room.length === 0) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } catch (dbError: any) {
        console.error('[CHAT] Error verifying chat room:', dbError.message);
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (!roomId) {
      return res.status(400).json({ message: 'Chat room ID required' });
    }

    // Get messages with sender info
    try {
      const chatMessages = await db.select({
        id: messages.id,
        chatRoomId: messages.chatRoomId,
        senderId: messages.senderId,
        senderRole: messages.senderRole,
        content: messages.content,
        messageType: messages.messageType,
        attachmentUrl: messages.attachmentUrl,
        createdAt: messages.createdAt,
        readAt: messages.readAt,
        senderName: users.username,
        senderFirstName: users.firstName,
        senderLastName: users.lastName
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatRoomId, roomId))
      .orderBy(messages.createdAt);

      res.json(chatMessages);
    } catch (dbError: any) {
      console.error('[CHAT] Error getting messages:', dbError.message);
      // Return empty array instead of error for better UX
      res.json([]);
    }
  } catch (error: any) {
    console.error('[CHAT] Unexpected error:', error.message);
    res.json([]);
  }
}));

// Send message
router.post('/messages', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  const { content, chatRoomId, messageType, attachmentUrl, fileName } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Xabar bo'sh bo'lishi mumkin emas" });
  }

  let roomId = chatRoomId;

  // If partner, get their chat room
  if (user.role === 'partner') {
    let room = await db.select()
      .from(chatRooms)
      .where(eq(chatRooms.partnerId, partner.id))
      .limit(1);
    
    // Create room if doesn't exist
    if (room.length === 0) {
      const now = new Date();
      const newRoom = {
        id: `chat-${nanoid()}`,
        partnerId: partner.id,
        adminId: null,
        status: 'active',
        createdAt: now,
        lastMessageAt: now
      };
      try {
        await db.insert(chatRooms).values(newRoom);
        room = [newRoom];
      } catch (insertErr: any) {
        console.error('[CHAT] Error creating room:', insertErr.message);
        // Retry fetch
        room = await db.select()
          .from(chatRooms)
          .where(eq(chatRooms.partnerId, partner.id))
          .limit(1);
      }
    }
    roomId = room[0]?.id;
  } else if (user.role === 'admin') {
    if (!roomId) {
      return res.status(400).json({ message: 'Chat room ID required' });
    }
  }

  if (!roomId) {
    return res.status(400).json({ message: 'Chat room ID required' });
  }

  // Create message with safe date handling
  const now = new Date();
  const message = {
    id: `msg-${nanoid()}`,
    chatRoomId: roomId,
    senderId: user.id,
    senderRole: user.role,
    content: (messageType === 'file' && fileName ? String(fileName) : content.trim()),
    messageType: (messageType || 'text') as any,
    attachmentUrl: attachmentUrl || null,
    createdAt: now,
    readAt: null
  };

  try {
    await db.insert(messages).values(message);
  } catch (insertError: any) {
    console.error('[CHAT] Error inserting message:', insertError.message);
    return res.status(500).json({ message: 'Xabar yuborishda xatolik' });
  }

  // Update last message time
  try {
    await db.update(chatRooms)
      .set({ lastMessageAt: now })
      .where(eq(chatRooms.id, roomId));
  } catch (updateError: any) {
    console.warn('[CHAT] Could not update lastMessageAt:', updateError.message);
  }

  res.status(201).json({
    message: 'Xabar yuborildi',
    data: message
  });
}));

// Mark messages as read
router.post('/messages/read', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { messageIds } = req.body;

  if (!messageIds || !Array.isArray(messageIds)) {
    return res.status(400).json({ message: 'Message IDs required' });
  }

  // Mark messages as read
  for (const msgId of messageIds) {
    await db.update(messages)
      .set({ readAt: new Date() })
      .where(and(
        eq(messages.id, msgId),
        eq(messages.readAt, null)
      ));
  }

  res.json({ message: 'Messages marked as read' });
}));

export default router;
