// @ts-nocheck
// Automatic Inventory Management Service
// Qoldiq kamayganda avtomatik xabar, reorder point, yetkazib beruvchilar integratsiyasi

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { wsManager } from '../websocket';

interface InventoryAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedOrder: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDaysUntilOut: number;
}

interface ReorderCalculation {
  reorderPoint: number;
  reorderQuantity: number;
  safetyStock: number;
  leadTime: number; // days
  averageDailySales: number;
}

// Calculate reorder point automatically
export async function calculateReorderPoint(productId: string): Promise<ReorderCalculation> {
  console.log(`📦 Calculating reorder point for product ${productId}`);
  
  try {
    // Get sales history (last 90 days)
    const salesHistory = await db.all(
      `SELECT date, orders, revenue 
       FROM analytics 
       WHERE product_id = ? 
       AND date >= date('now', '-90 days')
       ORDER BY date`,
      [productId]
    );
    
    // Calculate average daily sales
    const totalSales = salesHistory.reduce((sum, h) => sum + (h.orders || 0), 0);
    const averageDailySales = totalSales / 90 || 1;
    
    // Get lead time (default 7 days, can be configured per supplier)
    const leadTime = 7; // days
    
    // Calculate safety stock (20% of average monthly sales)
    const monthlySales = averageDailySales * 30;
    const safetyStock = Math.ceil(monthlySales * 0.2);
    
    // Reorder point = (average daily sales × lead time) + safety stock
    const reorderPoint = Math.ceil((averageDailySales * leadTime) + safetyStock);
    
    // Reorder quantity = average monthly sales
    const reorderQuantity = Math.ceil(monthlySales);
    
    return {
      reorderPoint,
      reorderQuantity,
      safetyStock,
      leadTime,
      averageDailySales
    };
  } catch (error: any) {
    console.error('Reorder point calculation error:', error);
    // Return safe defaults
    return {
      reorderPoint: 10,
      reorderQuantity: 50,
      safetyStock: 5,
      leadTime: 7,
      averageDailySales: 1
    };
  }
}

// Check inventory and create alerts
export async function checkInventoryLevels(partnerId: string): Promise<InventoryAlert[]> {
  console.log(`🔍 Checking inventory levels for partner ${partnerId}`);
  
  try {
    const products = await db.all(
      `SELECT id, name, stock_quantity, low_stock_threshold 
       FROM products 
       WHERE partner_id = ? AND is_active = 1`,
      [partnerId]
    );
    
    const alerts: InventoryAlert[] = [];
    
    for (const product of products) {
      const currentStock = product.stock_quantity || 0;
      const threshold = product.low_stock_threshold || 10;
      
      // Calculate reorder point if not set
      const reorderData = await calculateReorderPoint(product.id);
      const reorderPoint = product.low_stock_threshold || reorderData.reorderPoint;
      
      if (currentStock <= reorderPoint) {
        // Calculate urgency
        let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
        const estimatedDaysUntilOut = reorderData.averageDailySales > 0 
          ? Math.ceil(currentStock / reorderData.averageDailySales)
          : 999;
        
        if (currentStock === 0) {
          urgency = 'critical';
        } else if (estimatedDaysUntilOut <= 3) {
          urgency = 'high';
        } else if (estimatedDaysUntilOut <= 7) {
          urgency = 'medium';
        }
        
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock,
          reorderPoint,
          recommendedOrder: reorderData.reorderQuantity,
          urgency,
          estimatedDaysUntilOut
        });
        
        // Send real-time notification
        if (wsManager) {
          wsManager.sendToPartner(partnerId, {
            type: 'inventory_alert',
            data: {
              productId: product.id,
              productName: product.name,
              currentStock,
              urgency
            }
          });
        }
      }
    }
    
    // Save alerts to database
    for (const alert of alerts) {
      await db.run(
        `INSERT OR REPLACE INTO inventory_alerts 
         (product_id, current_stock, reorder_point, urgency, created_at, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [alert.productId, alert.currentStock, alert.reorderPoint, alert.urgency]
      );
    }
    
    return alerts;
  } catch (error: any) {
    console.error('Inventory check error:', error);
    return [];
  }
}

// Auto-reorder when stock is low
export async function autoReorder(productId: string): Promise<boolean> {
  console.log(`🛒 Auto-reordering product ${productId}`);
  
  try {
    const [product] = await db.all(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (!product) return false;
    
    const reorderData = await calculateReorderPoint(productId);
    
    // Create purchase order
    await db.run(
      `INSERT INTO purchase_orders 
       (partner_id, product_id, quantity, status, created_at)
       VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
      [product.partner_id, productId, reorderData.reorderQuantity]
    );
    
    // Notify partner
    if (wsManager) {
      wsManager.sendToPartner(product.partner_id, {
        type: 'auto_reorder',
        data: {
          productId,
          productName: product.name,
          quantity: reorderData.reorderQuantity
        }
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('Auto-reorder error:', error);
    return false;
  }
}

// Supplier integration (placeholder for future)
export async function integrateWithSupplier(supplierId: string, productId: string) {
  console.log(`🔗 Integrating with supplier ${supplierId} for product ${productId}`);
  
  // In production, this would integrate with supplier APIs
  // For now, return success
  return {
    success: true,
    supplierId,
    productId,
    integrationStatus: 'connected'
  };
}

export default {
  calculateReorderPoint,
  checkInventoryLevels,
  autoReorder,
  integrateWithSupplier
};

