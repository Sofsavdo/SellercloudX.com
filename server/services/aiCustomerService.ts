// AI-Powered Customer Service
// Chatbot, avtomatik javoblar, ticket management

import OpenAI from 'openai';
import { db } from '../db';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// AI Chatbot response
export async function getChatbotResponse(
  message: string,
  context?: any
): Promise<string> {
  console.log(`🤖 Chatbot processing message: ${message.substring(0, 50)}...`);
  
  try {
    const systemPrompt = `Siz SellerCloudX platformasining yordamchi chatbotsiz. 
O'zbek va Rus tillarida javob bering.
Professional, do'stona va foydali javoblar bering.
Agar savol javob berish qiyin bo'lsa, admin bilan bog'lanishni tavsiya qiling.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(context?.history || []),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const botResponse = response.choices[0].message.content || 'Kechirasiz, javob topa olmadim.';
    
    // Save conversation
    await db.run(
      `INSERT INTO chatbot_conversations 
       (user_message, bot_response, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [message, botResponse]
    );
    
    return botResponse;
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return 'Kechirasiz, xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
  }
}

// Auto-respond to common questions
export async function autoRespond(question: string): Promise<string | null> {
  const commonQuestions: Record<string, string> = {
    'narx': 'Narxlar mahsulot va tarifga qarab o\'zgaradi. Batafsil ma\'lumot uchun admin bilan bog\'laning.',
    'qanday qo\'shilish': 'Ro\'yxatdan o\'tish uchun /partner-registration sahifasiga kiring.',
    'to\'lov': 'To\'lovlar Click, Payme, Uzcard orqali amalga oshiriladi.',
    'yordam': 'Yordam uchun chat orqali admin bilan bog\'laning yoki support@sellercloudx.com ga yozing.'
  };
  
  const lowerQuestion = question.toLowerCase();
  for (const [key, answer] of Object.entries(commonQuestions)) {
    if (lowerQuestion.includes(key)) {
      return answer;
    }
  }
  
  return null;
}

// Create support ticket
export async function createTicket(
  customerId: string,
  subject: string,
  description: string
): Promise<Ticket> {
  console.log(`🎫 Creating ticket for customer ${customerId}`);
  
  try {
    const ticketId = `ticket_${Date.now()}`;
    
    // Auto-categorize with AI
    const category = await categorizeTicket(subject, description);
    
    // Auto-assign priority
    const priority = await determinePriority(subject, description);
    
    const ticket: Ticket = {
      id: ticketId,
      customerId,
      subject,
      description,
      status: 'open',
      priority,
      category,
      createdAt: new Date()
    };
    
    // Save ticket
    await db.run(
      `INSERT INTO support_tickets 
       (id, customer_id, subject, description, status, priority, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [ticketId, customerId, subject, description, 'open', priority, category]
    );
    
    return ticket;
  } catch (error: any) {
    console.error('Ticket creation error:', error);
    throw error;
  }
}

// Auto-categorize ticket
async function categorizeTicket(subject: string, description: string): Promise<string> {
  const prompt = `
Quyidagi support so'rovini kategoriyalashtiring:

SUBJECT: ${subject}
DESCRIPTION: ${description}

Kategoriyalar: technical, billing, product, account, other

Faqat kategoriya nomini qaytaring.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 10
    });

    return response.choices[0].message.content?.trim() || 'other';
  } catch (error) {
    return 'other';
  }
}

// Determine priority
async function determinePriority(subject: string, description: string): Promise<'low' | 'medium' | 'high' | 'urgent'> {
  const urgentKeywords = ['urgent', 'critical', 'broken', 'not working', 'error'];
  const highKeywords = ['important', 'issue', 'problem'];
  
  const text = `${subject} ${description}`.toLowerCase();
  
  if (urgentKeywords.some(k => text.includes(k))) {
    return 'urgent';
  } else if (highKeywords.some(k => text.includes(k))) {
    return 'high';
  } else {
    return 'medium';
  }
}

export default {
  getChatbotResponse,
  autoRespond,
  createTicket
};

