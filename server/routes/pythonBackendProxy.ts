/**
 * Python Backend Proxy Routes
 * 
 * Bu modul Node.js serverdan Python FastAPI backend'ga so'rovlarni proxy qiladi
 * Yandex Market va Uzum avtomatlashtirish API'lari uchun
 */

import { Router, Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

const router = Router();

// Python backend URL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8001';

// Proxy configuration
const proxyOptions: Options = {
  target: PYTHON_BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/yandex': '/api/yandex',
    '^/api/uzum-auto': '/api/uzum-auto',
    '^/api/ai-scanner': '/api/ai-scanner',
    '^/api/infographic': '/api/infographic'
  },
  onError: (err, req, res) => {
    console.error('❌ Python Backend Proxy Error:', err.message);
    (res as Response).status(502).json({
      success: false,
      error: 'Python backend ulanmadi',
      details: err.message
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying: ${req.method} ${req.path} -> ${PYTHON_BACKEND_URL}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Proxy Response: ${proxyRes.statusCode} for ${req.path}`);
  }
};

// Create proxy middleware
const pythonProxy = createProxyMiddleware(proxyOptions);

// Yandex Market API routes
router.use('/yandex', pythonProxy);

// Uzum Automation routes  
router.use('/uzum-auto', pythonProxy);

// AI Scanner routes
router.use('/ai-scanner', pythonProxy);

// Infographic generation routes
router.use('/infographic', pythonProxy);

export default router;
