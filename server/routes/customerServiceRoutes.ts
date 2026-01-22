// AI Customer Service Routes
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import aiCustomerService from '../services/aiCustomerService';

const router = express.Router();

// Chatbot response
router.post('/chatbot', asyncHandler(async (req: Request, res: Response) => {
  const { message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  // Try auto-respond first
  const autoResponse = await aiCustomerService.autoRespond(message);
  if (autoResponse) {
    return res.json({ response: autoResponse, source: 'auto' });
  }

  // Use AI chatbot
  const response = await aiCustomerService.getChatbotResponse(message, context);
  res.json({ response, source: 'ai' });
}));

// Create support ticket
router.post('/ticket', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subject, description } = req.body;
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ticket = await aiCustomerService.createTicket(user.id, subject, description);
  res.json(ticket);
}));

export default router;

