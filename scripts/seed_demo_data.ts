// Demo data seeder for SellerCloudX
import { db } from '../server/db';
import { products, partners } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  try {
    // Get first partner
    const [partner] = await db.select().from(partners).limit(1);
    
    if (!partner) {
      console.log('❌ No partners found. Please register a partner first.');
      return;
    }

    console.log(`📦 Adding products for partner: ${partner.businessName}`);

    // Demo products
    const demoProducts = [
      {
        id: nanoid(),
        partnerId: partner.id,
        name: 'Samsung Galaxy A54 5G',
        sku: 'SAM-A54-001',
        description: 'Samsung Galaxy A54 5G smartfoni - 128GB, 6GB RAM, Super AMOLED display',
        category: 'electronics',
        price: '4500000',
        costPrice: '3800000',
        stockQuantity: 50,
        isActive: true,
      },
      {
        id: nanoid(),
        partnerId: partner.id,
        name: 'Apple AirPods Pro 2',
        sku: 'APP-AIRP-002',
        description: 'Apple AirPods Pro 2 simsiz quloqchin - Active Noise Cancellation',
        category: 'electronics',
        price: '3200000',
        costPrice: '2700000',
        stockQuantity: 30,
        isActive: true,
      },
      {
        id: nanoid(),
        partnerId: partner.id,
        name: 'Nike Air Max 270',
        sku: 'NIK-AM270-003',
        description: 'Nike Air Max 270 sport poyafzali - erkaklar uchun',
        category: 'clothing',
        price: '1800000',
        costPrice: '1200000',
        stockQuantity: 100,
        isActive: true,
      },
      {
        id: nanoid(),
        partnerId: partner.id,
        name: 'Xiaomi Mi Robot Vacuum',
        sku: 'XIA-VAC-004',
        description: 'Xiaomi Mi Robot Vacuum - aqlli changyutgich robot',
        category: 'home',
        price: '2500000',
        costPrice: '1900000',
        stockQuantity: 20,
        isActive: true,
      },
      {
        id: nanoid(),
        partnerId: partner.id,
        name: 'Logitech MX Master 3',
        sku: 'LOG-MX3-005',
        description: 'Logitech MX Master 3 simsiz sichqoncha - professional',
        category: 'electronics',
        price: '1200000',
        costPrice: '900000',
        stockQuantity: 45,
        isActive: true,
      },
    ];

    for (const product of demoProducts) {
      try {
        await db.insert(products).values(product);
        console.log(`  ✅ Added: ${product.name}`);
      } catch (e: any) {
        if (e.message?.includes('UNIQUE')) {
          console.log(`  ⏭️ Skipped (exists): ${product.name}`);
        } else {
          console.log(`  ❌ Error: ${e.message}`);
        }
      }
    }

    console.log('\n✅ Demo data seeded successfully!');
    console.log('🤖 AI Manager will now start processing these products...');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

seedDemoData();
