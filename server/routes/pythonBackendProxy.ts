/**
 * Python Backend Proxy Routes
 * 
 * Bu modul Node.js serverdan Python FastAPI backend'ga so'rovlarni proxy qiladi
 * Yandex Market va Uzum avtomatlashtirish API'lari uchun
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const router = Router();

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8001';

console.log(`🔗 Python Backend Proxy URL: ${PYTHON_BACKEND_URL}`);

// Proxy configuration
const proxyOptions: Options = {
  target: PYTHON_BACKEND_URL,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('❌ Python Backend Proxy Error:', err.message);
    (res as Response).status(502).json({
      success: false,
      error: 'Python backend ulanmadi',
      details: err.message
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying: ${req.method} ${req.originalUrl} -> ${PYTHON_BACKEND_URL}${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Proxy Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
  }
};

// Create proxy middleware
const pythonProxy = createProxyMiddleware(proxyOptions);

// Catch-all proxy handler
router.use('/', pythonProxy);

export default router;
