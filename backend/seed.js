const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Container Handling Service',
    description: 'Professional container handling and storage services at major Indian ports. We provide efficient loading, unloading, and storage solutions with 24/7 availability.',
    category: 'container-handling',
    price: 8500,
    images: ['https://images.unsplash.com/photo-1501696806274-0cb4baf7d7c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250YWluZXIlMjBwb3J0fGVufDF8fHx8MTc1ODI3MzE1Nnww&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 10,
    location: {
      port: 'Jawaharlal Nehru Port, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    tags: ['container', 'handling', 'storage', 'port-services'],
    ratings: { average: 4.8, count: 245 }
  },
  {
    name: 'Customs Clearance Services',
    description: 'Complete customs clearance and documentation services for import and export operations. Fast and reliable processing with expert guidance through all regulatory requirements.',
    category: 'customs-clearance',
    price: 5000,
    images: ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21zJTIwZGV1dHkxfGVufDF8fHx8MTc1ODI3MzE1Nnww&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 5,
    location: {
      port: 'Chennai Port',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India'
    },
    tags: ['customs', 'clearance', 'documentation', 'import'],
    ratings: { average: 4.7, count: 189 }
  },
  {
    name: 'Freight Forwarding Services',
    description: 'Comprehensive freight forwarding solutions connecting your cargo from origin to destination. We handle all logistics, documentation, and customs procedures.',
    category: 'freight-forwarding',
    price: 12000,
    images: ['https://images.unsplash.com/photo-1574875873098-b40d47a7e8c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwcGluZyUyMGZyZWlnaHR8ZW58MXx8fHwxNzU4MjczMTU2fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 8,
    location: {
      port: 'Kolkata Port',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India'
    },
    tags: ['freight', 'forwarding', 'logistics', 'shipping'],
    ratings: { average: 4.6, count: 312 }
  },
  {
    name: 'Port Berth Booking',
    description: 'Secure berth allocation for vessels at major Indian ports. Professional booking and scheduling services with real-time availability tracking.',
    category: 'port-services',
    price: 15000,
    images: ['https://images.unsplash.com/photo-1564336379111-7e46b252a0b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGlwcGluZyUyMHBvcnR8ZW58MXx8fHwxNzU4MjczMTU2fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 20,
    location: {
      port: 'Jawaharlal Nehru Port, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    tags: ['berth', 'booking', 'allocation', 'vessel'],
    ratings: { average: 4.9, count: 187 }
  },
  {
    name: 'Warehousing Solutions',
    description: 'Secure and climate-controlled warehousing facilities near major ports. Complete inventory management, handling, and distribution services.',
    category: 'warehousing',
    price: 7500,
    images: ['https://images.unsplash.com/photo-1497215728101-856f4ea42174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBsb2dpc3RpY3N8ZW58MXx8fHwxNzU4MjczMTU2fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 15,
    location: {
      port: 'Chennai Port',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India'
    },
    tags: ['warehousing', 'storage', 'inventory', 'logistics'],
    ratings: { average: 4.5, count: 156 }
  },
  {
    name: 'Shipping Insurance',
    description: 'Comprehensive marine insurance coverage for cargo and vessels. Protect your shipments with our competitive rates and quick claim processing.',
    category: 'insurance',
    price: 2500,
    images: ['https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpbmUlMjBpbnN1cmFuY2V8ZW58MXx8fHwxNzU4MjczMTU2fDA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 50,
    location: {
      port: 'All Major Ports',
      city: 'India',
      state: 'All States',
      country: 'India'
    },
    tags: ['insurance', 'marine', 'cargo', 'protection'],
    ratings: { average: 4.4, count: 98 }
  }
];

const seedProducts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // 1. Find or create a default seller user
    let seller = await User.findOne({ email: 'provider@example.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Port Services Provider',
        email: 'provider@example.com',
        password: 'password123',
        role: 'seller',
        sellerType: 'manufacturer',
        verification: { isVerified: true, verifiedAt: new Date() },
        profile: { company: { name: 'Port Solutions India' } }
      });
      console.log('Created default seller');
    } else {
      console.log('Using existing seller');
    }

    // 2. Find or create a default admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        verification: { isVerified: true, verifiedAt: new Date() }
      });
      console.log('Created default admin');
    } else {
      console.log('Using existing admin');
    }

    // 3. Insert Products only if they don't exist (Check by name)
    let insertedCount = 0;
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      
      if (!existingProduct) {
        await Product.create({
          ...productData,
          seller: seller._id,
          isActive: true,
          isVerified: true
        });
        insertedCount++;
      }
    }

    console.log(`Inserted ${insertedCount} new products. ${sampleProducts.length - insertedCount} already existed.`);

    await mongoose.connection.close();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedProducts();