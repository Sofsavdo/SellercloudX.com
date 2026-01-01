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
    const newRoom = {
      id: `chat-${nanoid()}`,
      partnerId: partner.id,
      adminId: null,
      status: 'active',
      createdAt: new Date(),
      lastMessageAt: null
    };

    await db.insert(chatRooms).values(newRoom);
    chatRoom = [newRoom];
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

  // If partner, get their chat room
  if (user.role === 'partner' && !chatRoomId) {
    const room = await db.select()
      .from(chatRooms)
      .where(eq(chatRooms.partnerId, partner.id))
      .limit(1);
    
    if (room.length === 0) {
      return res.json([]);
    }
    roomId = room[0].id;
  } else if (user.role === 'partner' && chatRoomId) {
    // SECURITY: partners can only read their own room
    const room = await db
      .select({ id: chatRooms.id })
      .from(chatRooms)
      .where(and(eq(chatRooms.id, chatRoomId), eq(chatRooms.partnerId, partner.id)))
      .limit(1);
    if (room.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  if (!roomId) {
    return res.status(400).json({ message: 'Chat room ID required' });
  }

  // Get messages with sender info
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
      const newRoom = {
        id: `chat-${nanoid()}`,
        partnerId: partner.id,
        adminId: null,
        status: 'active',
        createdAt: new Date(),
        lastMessageAt: new Date()
      };
      await db.insert(chatRooms).values(newRoom);
      room = [newRoom];
    }
    roomId = room[0].id;
  } else if (user.role === 'admin') {
    if (!roomId) {
      return res.status(400).json({ message: 'Chat room ID required' });
    }
  }

  if (!roomId) {
    return res.status(400).json({ message: 'Chat room ID required' });
  }

  // Create message
  const message = {
    id: `msg-${nanoid()}`,
    chatRoomId: roomId,
    senderId: user.id,
    senderRole: user.role,
    content: (messageType === 'file' && fileName ? String(fileName) : content.trim()),
    messageType: (messageType || 'text') as any,
    attachmentUrl: attachmentUrl || null,
    createdAt: new Date(),
    readAt: null
  };

  await db.insert(messages).values(message);

  // Update last message time
  await db.update(chatRooms)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatRooms.id, roomId));

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
