// Uzum Market Direct API Routes
// Real API integration with working authorization

import { Router, Request, Response } from 'express';
import UzumMarketService from '../services/uzumMarketService';

const router = Router();

// Initialize service
const uzumService = new UzumMarketService();

// Test Uzum API connection
router.get('/test-connection', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing Uzum Market API connection...');
    const result = await uzumService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Uzum Market API muvaffaqiyatli ulandi!',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Uzum Market API ulanmadi',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('❌ Uzum connection test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get FBS stocks (SKU inventory)
router.get('/stocks', async (req: Request, res: Response) => {
  try {
    console.log('📦 Fetching Uzum Market stocks...');
    const stocks = await uzumService.getStocks();
    
    if (stocks) {
      res.json({
        success: true,
        data: stocks
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Stocks ma\'lumotlari olinmadi'
      });
    }
  } catch (error: any) {
    console.error('❌ Uzum stocks error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get FBS orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    console.log('📋 Fetching Uzum Market orders...');
    const orders = await uzumService.getOrders(limit, offset);
    
    if (orders) {
      res.json({
        success: true,
        data: orders
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Orders ma\'lumotlari olinmadi'
      });
    }
  } catch (error: any) {
    console.error('❌ Uzum orders error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order by ID
router.get('/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    console.log(`📋 Fetching Uzum order ${orderId}...`);
    
    const order = await uzumService.getOrderById(orderId);
    
    if (order) {
      res.json({
        success: true,
        data: order
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Buyurtma topilmadi'
      });
    }
  } catch (error: any) {
    console.error('❌ Uzum order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create product on Uzum Market
router.post('/products', async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    console.log('📦 Creating product on Uzum Market:', productData.title);
    
    const result = await uzumService.createProduct(productData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Mahsulot Uzum Market\'ga qo\'shildi!',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Mahsulot qo\'shilmadi',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('❌ Uzum create product error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update product price
router.patch('/products/:productId/price', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { price } = req.body;
    
    console.log(`💰 Updating price for product ${productId} to ${price}...`);
    
    const success = await uzumService.updatePrice(productId, price);
    
    if (success) {
      res.json({
        success: true,
        message: 'Narx yangilandi!'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Narx yangilanmadi'
      });
    }
  } catch (error: any) {
    console.error('❌ Uzum price update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
