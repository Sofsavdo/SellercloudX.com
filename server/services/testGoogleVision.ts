// Test script for Google Vision API
import { realGoogleVisionService } from './realGoogleVisionService';

async function testVision() {
  console.log('🧪 Testing Google Vision API...');
  console.log('=' .repeat(50));

  // Test with a sample image URL
  const testImageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  try {
    console.log('📸 Analyzing image:', testImageUrl);
    const result = await realGoogleVisionService.analyzeImage(testImageUrl);

    console.log('\n✅ Analysis Result:');
    console.log('---');
    console.log(`Product Name: ${result.productName}`);
    console.log(`Brand: ${result.brand}`);
    console.log(`Category: ${result.category}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Description: ${result.description}`);
    console.log(`Labels (${result.labels.length}):`, result.labels.slice(0, 10).join(', '));
    console.log(`Web Entities (${result.webEntities.length}):`);
    result.webEntities.slice(0, 5).forEach((entity, i) => {
      console.log(`  ${i + 1}. ${entity.description} (score: ${entity.score.toFixed(2)})`);
    });
    console.log(`\nSuccess: ${result.success ? '✅ YES' : '❌ NO'}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test complete!');
}

// Run test
testVision().catch(console.error);
