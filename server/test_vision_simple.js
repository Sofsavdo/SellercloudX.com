const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  keyFilename: '/app/google-vision-credentials.json'
});

console.log('🧪 Testing Google Vision API...');

const imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

client.annotateImage({
  image: { source: { imageUri: imageUrl } },
  features: [
    { type: 'LABEL_DETECTION', maxResults: 10 },
    { type: 'WEB_DETECTION', maxResults: 10 },
  ],
}).then(([result]) => {
  console.log('\n✅ SUCCESS! Google Vision API is WORKING!');
  console.log('\n📊 Results:');
  const labels = result.labelAnnotations?.slice(0, 5).map(l => l.description).join(', ');
  const webEntities = result.webDetection?.webEntities?.slice(0, 3).map(e => e.description).join(', ');
  console.log('Labels:', labels);
  console.log('Web Entities:', webEntities);
  console.log('\n🎉 API fully functional!');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
});
