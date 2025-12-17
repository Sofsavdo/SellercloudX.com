// Warehouse Management System - For Local Full-Service Model
// Barcode scanning, pick/pack workflow, inventory tracking

import { storage } from '../storage';
import { nanoid } from 'nanoid';

export interface BarcodeData {
  productId: string;
  sku: string;
  barcode: string;
  name: string;
  location?: string;
}

export interface PickList {
  id: string;
  orderId: string;
  orderNumber: string;
  items: PickListItem[];
  status: 'pending' | 'picking' | 'picked' | 'packing' | 'packed' | 'shipped';
  assignedTo?: string;
  createdAt: Date;
  pickedAt?: Date;
  packedAt?: Date;
}

export interface PickListItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  location: string;
  barcode: string;
  picked: boolean;
  pickedQuantity: number;
}

export interface PackingSlip {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  shippingAddress: string;
  items: PackingSlipItem[];
  totalWeight: number;
  shippingMethod: string;
  trackingNumber?: string;
  createdAt: Date;
}

export interface PackingSlipItem {
  sku: string;
  name: string;
  quantity: number;
  weight: number;
}

export interface WarehouseZone {
  id: string;
  name: string;
  code: string;
  type: 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping';
  capacity: number;
  currentLoad: number;
}

class WarehouseManagement {
  // ==================== BARCODE MANAGEMENT ====================

  // Generate barcode for product
  generateBarcode(productId: string, sku: string): string {
    // Generate EAN-13 compatible barcode
    // Format: 200 (prefix) + 10 digits (product ID hash) + check digit
    const prefix = '200';
    const productHash = this.hashProductId(productId);
    const barcode = prefix + productHash;
    const checkDigit = this.calculateEAN13CheckDigit(barcode);
    return barcode + checkDigit;
  }

  // Hash product ID to 10 digits
  private hashProductId(productId: string): string {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString().padStart(10, '0').slice(0, 10);
  }

  // Calculate EAN-13 check digit
  private calculateEAN13CheckDigit(barcode: string): string {
    let sum = 0;
    for (let i = 0; i < barcode.length; i++) {
      const digit = parseInt(barcode[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  // Scan barcode and get product info
  async scanBarcode(barcode: string): Promise<BarcodeData | null> {
    try {
      console.log(`📷 Scanning barcode: ${barcode}`);
      
      // Query database for product by barcode
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        console.log(`❌ Product not found for barcode: ${barcode}`);
        return null;
      }

      // Get warehouse location for product
      const location = await this.getProductLocationFromDB(product.id);
      
      return {
        productId: product.id,
        sku: product.sku || '',
        barcode: product.barcode || barcode,
        name: product.name,
        location: location || 'Unknown'
      };
    } catch (error) {
      console.error('Error scanning barcode:', error);
      return null;
    }
  }

  // ==================== PICK LIST MANAGEMENT ====================

  // Generate pick list for order
  async generatePickList(orderId: string): Promise<PickList> {
    try {
      // Get order from database
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Get order items
      const orderItems = await storage.getOrderItems(orderId);

      const pickListItems: PickListItem[] = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          const location = await this.getProductLocationFromDB(item.productId);
          
          return {
            productId: item.productId,
            sku: product?.sku || '',
            name: product?.name || 'Unknown Product',
            quantity: item.quantity,
            location: location || this.getProductLocation(item.productId),
            barcode: product?.barcode || this.generateBarcode(item.productId, product?.sku || ''),
            picked: false,
            pickedQuantity: 0
          };
        })
      );

      const pickList: PickList = {
        id: nanoid(),
        orderId,
        orderNumber: order.orderNumber,
        items: pickListItems,
        status: 'pending',
        createdAt: new Date()
      };

      console.log(`📋 Pick list generated for order ${order.orderNumber}`);
      return pickList;
    } catch (error) {
      console.error('Error generating pick list:', error);
      throw error;
    }
  }

  // Get product location from database
  private async getProductLocationFromDB(productId: string): Promise<string | null> {
    try {
      // Query warehouse stock for product location
      const warehouses = await storage.getAllWarehouses();
      
      for (const warehouse of warehouses) {
        const stock = await storage.getWarehouseStock(warehouse.id);
        const productStock = stock.find(s => s.productId === productId);
        
        if (productStock && productStock.location) {
          return productStock.location;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting product location:', error);
      return null;
    }
  }

  // Get product location in warehouse (fallback to generated location)
  private getProductLocation(productId: string): string {
    // Generate location based on product ID hash for consistency
    const hash = this.hashProductId(productId);
    const zoneNum = parseInt(hash.substring(0, 1)) % 5;
    const zone = String.fromCharCode(65 + zoneNum); // A-E
    const aisle = hash.substring(1, 3);
    const shelf = hash.substring(3, 5);
    return `${zone}-${aisle}-${shelf}`;
  }

  // Mark item as picked
  async markItemPicked(pickListId: string, productId: string, quantity: number): Promise<void> {
    console.log(`✅ Marked ${quantity} units of ${productId} as picked in pick list ${pickListId}`);
    // TODO: Update database
  }

  // Complete pick list
  async completePickList(pickListId: string): Promise<void> {
    console.log(`✅ Pick list ${pickListId} completed`);
    // TODO: Update status to 'picked'
  }

  // ==================== PACKING SLIP MANAGEMENT ====================

  // Generate packing slip
  async generatePackingSlip(orderId: string): Promise<PackingSlip> {
    try {
      // Get order from database
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Get order items
      const orderItems = await storage.getOrderItems(orderId);
      
      const packingSlipItems: PackingSlipItem[] = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          
          return {
            sku: product?.sku || '',
            name: product?.name || 'Unknown Product',
            quantity: item.quantity,
            weight: parseFloat(product?.weight || '0')
          };
        })
      );

      const totalWeight = packingSlipItems.reduce((sum, item) => 
        sum + (item.weight * item.quantity), 0
      );

      const packingSlip: PackingSlip = {
        id: nanoid(),
        orderId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress || '',
        items: packingSlipItems,
        totalWeight,
        shippingMethod: 'Standard', // Default shipping method
        trackingNumber: order.trackingNumber,
        createdAt: new Date()
      };

      console.log(`📦 Packing slip generated for order ${order.orderNumber}`);
      return packingSlip;
    } catch (error) {
      console.error('Error generating packing slip:', error);
      throw error;
    }
  }

  // Old mock implementation removed
  async _generatePackingSlipOld(orderId: string): Promise<PackingSlip> {
    try {
      const order: any = {
        id: orderId,
        orderNumber: 'ORD-123',
        customerName: 'John Doe',
        shippingAddress: 'Tashkent, Uzbekistan',
        shippingMethod: 'Express',
        items: [
          { sku: 'SKU-1', name: 'Product 1', quantity: 2, weight: 0.5 },
          { sku: 'SKU-2', name: 'Product 2', quantity: 1, weight: 1.0 }
        ]
      };

      const totalWeight = order.items.reduce((sum: number, item: any) => 
        sum + (item.weight * item.quantity), 0
      );

      const packingSlip: PackingSlip = {
        id: nanoid(),
        orderId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        shippingAddress: order.shippingAddress,
        items: order.items,
        totalWeight,
        shippingMethod: order.shippingMethod,
        createdAt: new Date()
      };

      console.log(`📦 Packing slip generated for order ${order.orderNumber}`);
      return packingSlip;
    } catch (error) {
      console.error('Error generating packing slip:', error);
      throw error;
    }
  }

  // Print packing slip (generate PDF/HTML)
  async printPackingSlip(packingSlipId: string): Promise<string> {
    // TODO: Generate PDF or HTML for printing
    return `<html>Packing Slip ${packingSlipId}</html>`;
  }

  // ==================== WAREHOUSE ZONES ====================

  // Get all warehouse zones
  async getWarehouseZones(): Promise<WarehouseZone[]> {
    // TODO: Get from database
    // For now, return mock zones
    return [
      {
        id: 'zone-1',
        name: 'Receiving Area',
        code: 'RCV',
        type: 'receiving',
        capacity: 1000,
        currentLoad: 250
      },
      {
        id: 'zone-2',
        name: 'Storage Zone A',
        code: 'STA',
        type: 'storage',
        capacity: 5000,
        currentLoad: 3200
      },
      {
        id: 'zone-3',
        name: 'Picking Zone',
        code: 'PCK',
        type: 'picking',
        capacity: 2000,
        currentLoad: 1500
      },
      {
        id: 'zone-4',
        name: 'Packing Station',
        code: 'PAK',
        type: 'packing',
        capacity: 500,
        currentLoad: 120
      },
      {
        id: 'zone-5',
        name: 'Shipping Dock',
        code: 'SHP',
        type: 'shipping',
        capacity: 1000,
        currentLoad: 300
      }
    ];
  }

  // Get zone utilization
  getZoneUtilization(zone: WarehouseZone): number {
    return Math.round((zone.currentLoad / zone.capacity) * 100);
  }

  // ==================== INVENTORY MOVEMENT ====================

  // Record inventory movement
  async recordMovement(
    productId: string,
    fromLocation: string,
    toLocation: string,
    quantity: number,
    reason: string
  ): Promise<void> {
    console.log(`📦 Moving ${quantity} units of ${productId} from ${fromLocation} to ${toLocation}`);
    console.log(`   Reason: ${reason}`);
    // TODO: Record in database
  }

  // ==================== REPORTING ====================

  // Get warehouse performance metrics
  async getPerformanceMetrics(): Promise<{
    pickRate: number; // items per hour
    packRate: number; // orders per hour
    accuracy: number; // percentage
    utilizationRate: number; // percentage
  }> {
    // TODO: Calculate from real data
    return {
      pickRate: 45, // 45 items per hour
      packRate: 15, // 15 orders per hour
      accuracy: 99.2, // 99.2% accuracy
      utilizationRate: 68 // 68% warehouse utilization
    };
  }
}

// Export singleton instance
export const warehouseManagement = new WarehouseManagement();

// Export for testing
export { WarehouseManagement };
