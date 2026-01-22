// Test Uzum & Yandex Market APIs
import { uzumMarketService } from './dist/services/uzumMarketService.js';
import { yandexMarketService } from './dist/services/yandexMarketService.js';

console.log('🧪 TESTING MARKETPLACE APIs');
console.log('='.repeat(60));

// Test Uzum Market
console.log('\n1️⃣ UZUM MARKET:');
try {
  const uzumConnected = await uzumMarketService.testConnection();
  if (uzumConnected) {
    console.log('✅ Uzum Market: CONNECTED');
  } else {
    console.log('❌ Uzum Market: FAILED');
  }
} catch (error) {
  console.log('❌ Uzum Market: ERROR', error.message);
}

// Test Yandex Market
console.log('\n2️⃣ YANDEX MARKET:');
try {
  const yandexConnected = await yandexMarketService.testConnection();
  if (yandexConnected) {
    console.log('✅ Yandex Market: CONNECTED');
  } else {
    console.log('❌ Yandex Market: FAILED');
  }
} catch (error) {
  console.log('❌ Yandex Market: ERROR', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('🏁 Test complete!');
