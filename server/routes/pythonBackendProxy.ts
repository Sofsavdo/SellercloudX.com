/**
 * Python Backend Proxy Routes
 * 
 * Bu modul Node.js serverdan Python FastAPI backend'ga so'rovlarni proxy qiladi
 * Yandex Market va Uzum avtomatlashtirish API'lari uchun
 */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';

const router = Router();

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8001';

console.log(`🔗 Python Backend Proxy URL: ${PYTHON_BACKEND_URL}`);

// Universal proxy handler
router.all('*', async (req: Request, res: Response) => {
  try {
    const targetUrl = `${PYTHON_BACKEND_URL}${req.originalUrl}`;
    console.log(`🔄 Proxying: ${req.method} ${req.originalUrl} -> ${targetUrl}`);
    
    // Pass through important headers including Authorization
    const proxyHeaders: Record<string, string> = {
      'Content-Type': req.headers['content-type'] as string || 'application/json',
      'Accept': 'application/json'
    };
    
    // Pass Authorization header if present
    if (req.headers.authorization) {
      proxyHeaders['Authorization'] = req.headers.authorization as string;
    }
    
    const response = await axios({
      method: req.method as any,
      url: targetUrl,
      data: req.body,
      headers: proxyHeaders,
      timeout: 120000, // 2 daqiqa timeout
      validateStatus: () => true // Barcha status kodlarini qabul qilish
    });
    
    console.log(`✅ Proxy Response: ${response.status} for ${req.originalUrl}`);
    
    res.status(response.status).json(response.data);
    
  } catch (error: any) {
    console.error('❌ Python Backend Proxy Error:', error.message);
    res.status(502).json({
      success: false,
      error: 'Python backend ulanmadi',
      details: error.message
    });
  }
});

export default router;
