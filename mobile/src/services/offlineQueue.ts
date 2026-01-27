// Offline Queue Service - Internetsiz ishlash uchun
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS, QUEUE_STATUS } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { yandexApi } from './api';

// Queue item interface
export interface QueueItem {
  id: string;
  type: 'yandex_upload' | 'uzum_upload' | 'product_create';
  data: any;
  status: typeof QUEUE_STATUS[keyof typeof QUEUE_STATUS];
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

// Queue class
class OfflineQueue {
  private isProcessing = false;
  private listeners: ((items: QueueItem[]) => void)[] = [];
  
  // Queue'ga item qo'shish
  async addToQueue(type: QueueItem['type'], data: any): Promise<QueueItem> {
    const item: QueueItem = {
      id: generateId(),
      type,
      data,
      status: QUEUE_STATUS.PENDING,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
    };
    
    const queue = await this.getQueue();
    queue.push(item);
    await this.saveQueue(queue);
    
    this.notifyListeners();
    
    // Avtomatik yuklashni boshlash
    this.processQueue();
    
    return item;
  }
  
  // Queue'ni olish
  async getQueue(): Promise<QueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  // Queue'ni saqlash
  private async saveQueue(queue: QueueItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  }
  
  // Item'ni o'chirish
  async removeItem(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await this.saveQueue(filtered);
    this.notifyListeners();
  }
  
  // Item statusini yangilash
  private async updateItemStatus(
    id: string, 
    status: QueueItem['status'], 
    error?: string
  ): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find(i => i.id === id);
    
    if (item) {
      item.status = status;
      item.lastAttempt = new Date().toISOString();
      if (error) item.error = error;
      if (status === QUEUE_STATUS.FAILED) item.retryCount++;
      
      await this.saveQueue(queue);
      this.notifyListeners();
    }
  }
  
  // Queue'ni qayta ishlash
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    // Internet bormi?
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('📴 Internet yo\'q, queue to\'xtatildi');
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const queue = await this.getQueue();
      const pendingItems = queue.filter(
        item => item.status === QUEUE_STATUS.PENDING || 
                (item.status === QUEUE_STATUS.FAILED && item.retryCount < item.maxRetries)
      );
      
      for (const item of pendingItems) {
        await this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  // Bir item'ni qayta ishlash
  private async processItem(item: QueueItem): Promise<void> {
    console.log(`📤 Processing: ${item.id} (${item.type})`);
    
    await this.updateItemStatus(item.id, QUEUE_STATUS.UPLOADING);
    
    try {
      switch (item.type) {
        case 'yandex_upload':
          await yandexApi.autoCreate(item.data);
          break;
        
        case 'uzum_upload':
          // TODO: Uzum API
          break;
        
        case 'product_create':
          // TODO: Product create API
          break;
      }
      
      await this.updateItemStatus(item.id, QUEUE_STATUS.COMPLETED);
      console.log(`✅ Completed: ${item.id}`);
      
    } catch (error: any) {
      console.error(`❌ Failed: ${item.id}`, error.message);
      await this.updateItemStatus(item.id, QUEUE_STATUS.FAILED, error.message);
    }
  }
  
  // Qayta urinish
  async retryItem(id: string): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find(i => i.id === id);
    
    if (item && item.status === QUEUE_STATUS.FAILED) {
      item.status = QUEUE_STATUS.PENDING;
      item.error = undefined;
      await this.saveQueue(queue);
      this.processQueue();
    }
  }
  
  // Listener qo'shish
  subscribe(callback: (items: QueueItem[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  // Listener'larni xabardor qilish
  private async notifyListeners(): Promise<void> {
    const queue = await this.getQueue();
    this.listeners.forEach(callback => callback(queue));
  }
  
  // Statistika
  async getStats(): Promise<{
    pending: number;
    uploading: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const queue = await this.getQueue();
    return {
      pending: queue.filter(i => i.status === QUEUE_STATUS.PENDING).length,
      uploading: queue.filter(i => i.status === QUEUE_STATUS.UPLOADING).length,
      completed: queue.filter(i => i.status === QUEUE_STATUS.COMPLETED).length,
      failed: queue.filter(i => i.status === QUEUE_STATUS.FAILED).length,
      total: queue.length,
    };
  }
  
  // Completed item'larni tozalash
  async clearCompleted(): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(item => item.status !== QUEUE_STATUS.COMPLETED);
    await this.saveQueue(filtered);
    this.notifyListeners();
  }
  
  // Specific completed item ni tozalash (data bo'yicha)
  async removeCompleted(data: any): Promise<void> {
    try {
      const queue = await this.getQueue();
      // Remove items that match the data and are completed or match exactly
      const filtered = queue.filter(item => {
        if (item.status === QUEUE_STATUS.COMPLETED) {
          // Check if data matches
          const itemPartnerId = item.data?.partner_id;
          const dataPartnerId = data?.partner_id;
          const itemCost = item.data?.cost_price;
          const dataCost = data?.cost_price;
          
          if (itemPartnerId === dataPartnerId && itemCost === dataCost) {
            return false; // Remove this item
          }
        }
        return true;
      });
      await this.saveQueue(filtered);
      this.notifyListeners();
    } catch (error) {
      console.log('removeCompleted error:', error);
    }
  }
}

export const offlineQueue = new OfflineQueue();

// Network o'zgarishini kuzatish
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    console.log('🌐 Internet qaytdi, queue ni qayta ishlaymiz...');
    offlineQueue.processQueue();
  }
});

export default offlineQueue;
