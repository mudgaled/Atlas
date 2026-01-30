/**
 * INDUSTRIAL SUPPLY CHAIN SEED SCRIPT
 * Context: Shandong Climate Control & Pan-Chinese Furniture
 * Target: MongoDB (Mongoose ODM)
 * Update: FIXED broken image links with verified Unsplash IDs.
 */

const mongoose = require('mongoose');
const Product = require('./models/Product'); 
const User = require('./models/User'); 

const seedDB = async () => {
    try {
        console.log("Starting Incremental Seed Process...");

        const upsertSeller = async (data) => {
            const existing = await User.findOne({
                name: data.name,
                role: 'seller'
            });

            if (existing) {
                console.log(`- Seller "${data.name}" already exists. Skipping.`);
                return existing;
            }

            const sellerData = {
                name: data.name,
                email: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}@example.com`,
                password: 'password123', 
                role: 'seller',
                sellerType: data.businessType === 'Manufacturer' ? 'manufacturer' : 'trader',
                verification: {
                    isVerified: true,
                    verifiedAt: new Date()
                },
                profile: {
                    company: { name: data.name },
                    address: {
                        street: data.location.address || '',
                        city: data.location.city,
                        state: data.location.province,
                        country: data.location.country || 'China'
                    },
                    phone: data.contact?.phone || ''
                }
            };

            return await User.create(sellerData);
        };

        // 1. Create/Retrieve Sellers
        const s1 = await upsertSeller({
            name: "Shandong Xinyu Runhua Machinery Co., Ltd.",
            businessType: "Trading Company",
            location: { address: "Laiwu District", city: "Jinan", province: "Shandong", country: "China" }
        });

        const s2 = await upsertSeller({
            name: "Qingzhou Duohui New Material Technology Co., Ltd.",
            businessType: "Manufacturer",
            location: { address: "Taihua Building", city: "Qingzhou", province: "Shandong", country: "China" }
        });

        // 2. Define Products with VERIFIED WORKING Images
        const productList = [
            {
                name: "Corrugated Galvanized Feed Silo",
                description: "High-capacity, weather-resistant grain storage silo with hot-dip galvanized coating for long-term corrosion protection in agricultural environments.",
                category: "warehousing",
                price: 2800,
                currency: "USD",
                // Verified Image: Large metal silo (Camylla Battani / Unsplash)
                images: ["https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80"],
                stock: 10,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["silo", "agriculture", "livestock", "storage"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Cooling Pad Production Line",
                description: "Full-scale manufacturing assembly for evaporative cellulose cooling pads, including resin coating, corrugated forming, and precision cutting modules.",
                category: "logistics",
                price: 52000,
                currency: "USD",
                // Verified Image: Industrial factory machinery/automation (Science in HD / Unsplash)
                images: ["https://images.unsplash.com/photo-1581093458791-9f302e6d8369?auto=format&fit=crop&q=80"],
                stock: 5,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["machinery", "hvac", "manufacturing", "cooling"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Steel Processing Machine",
                description: "Advanced steel processing machine for heavy-duty industrial applications with precision cutting capabilities.",
                category: "logistics",
                price: 45000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504672281656-e4981d70514d?auto=format&fit=crop&q=80"],
                stock: 8,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["steel", "processing", "machine", "industrial"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Packaging System",
                description: "High-speed automated packaging system for food and consumer goods industries.",
                category: "logistics",
                price: 32000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 12,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["packaging", "automation", "food", "goods"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Refrigeration Unit",
                description: "Energy-efficient commercial refrigeration unit for supermarkets and cold storage facilities.",
                category: "warehousing",
                price: 8500,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1519564540121-5b1a1e073bc3?auto=format&fit=crop&q=80"],
                stock: 15,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["refrigeration", "commercial", "cold", "storage"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Precision CNC Lathe Machine",
                description: "Computer numerical control lathe machine for precision metalworking and manufacturing.",
                category: "logistics",
                price: 65000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&q=80"],
                stock: 6,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["cnc", "lathe", "precision", "metalworking"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Large-Scale Conveyor Belt System",
                description: "Heavy-duty conveyor belt system for industrial automation and material handling.",
                category: "logistics",
                price: 22000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1595142884931-6fc94f715e57?auto=format&fit=crop&q=80"],
                stock: 9,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["conveyor", "belt", "automation", "material"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Air Compressor",
                description: "High-capacity industrial air compressor for manufacturing and construction applications.",
                category: "logistics",
                price: 12000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504148455447-3bc3e3e0e1c4?auto=format&fit=crop&q=80"],
                stock: 20,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["compressor", "air", "industrial", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Warehouse Robot",
                description: "Autonomous mobile robot for warehouse automation and inventory management.",
                category: "warehousing",
                price: 38000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1534030507896-1b4b961de23f?auto=format&fit=crop&q=80"],
                stock: 7,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["robot", "warehouse", "automation", "inventory"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial 3D Printing System",
                description: "Large-scale industrial 3D printing system for rapid prototyping and manufacturing.",
                category: "logistics",
                price: 75000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80"],
                stock: 4,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["3d", "printing", "prototyping", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Bakery Oven",
                description: "Large commercial bakery oven for bread and pastry production with multiple temperature zones.",
                category: "warehousing",
                price: 18000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80"],
                stock: 11,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["oven", "bakery", "commercial", "bread"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Laser Cutting Machine",
                description: "High-precision laser cutting machine for metal fabrication and manufacturing.",
                category: "logistics",
                price: 85000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&q=80"],
                stock: 5,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["laser", "cutting", "metal", "fabrication"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Sorting System",
                description: "High-speed automated sorting system for packages and parcels in logistics centers.",
                category: "logistics",
                price: 42000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1595142884931-6fc94f715e57?auto=format&fit=crop&q=80"],
                stock: 8,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["sorting", "automation", "logistics", "packages"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Vacuum Pump",
                description: "High-performance industrial vacuum pump for manufacturing and laboratory applications.",
                category: "logistics",
                price: 9500,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504148455447-3bc3e3e0e1c4?auto=format&fit=crop&q=80"],
                stock: 25,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["vacuum", "pump", "industrial", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Cold Storage Container",
                description: "Temperature-controlled cold storage container for food preservation and transport.",
                category: "warehousing",
                price: 15000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1512529929974-95b3a0a7a12d?auto=format&fit=crop&q=80"],
                stock: 14,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["cold", "storage", "container", "transport"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Welding Robot",
                description: "Automated welding robot for precision metal joining in manufacturing processes.",
                category: "logistics",
                price: 55000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1534030507896-1b4b961de23f?auto=format&fit=crop&q=80"],
                stock: 6,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["welding", "robot", "automation", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Dishwasher",
                description: "Heavy-duty commercial dishwasher for restaurants and food service establishments.",
                category: "warehousing",
                price: 6500,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 18,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["dishwasher", "commercial", "restaurant", "cleaning"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Mixing Tank",
                description: "Large-capacity industrial mixing tank for chemical and food processing applications.",
                category: "logistics",
                price: 28000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 10,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["mixing", "tank", "industrial", "processing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Palletizer",
                description: "Robotic palletizing system for automated loading and stacking of goods.",
                category: "warehousing",
                price: 35000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1595142884931-6fc94f715e57?auto=format&fit=crop&q=80"],
                stock: 7,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["palletizer", "automation", "loading", "stacking"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Heat Exchanger",
                description: "High-efficiency heat exchanger for thermal management in industrial processes.",
                category: "logistics",
                price: 22000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504148455447-3bc3e3e0e1c4?auto=format&fit=crop&q=80"],
                stock: 12,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["heat", "exchanger", "thermal", "process"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Ice Maker",
                description: "High-capacity commercial ice maker for restaurants and hospitality businesses.",
                category: "warehousing",
                price: 4200,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 22,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["ice", "maker", "commercial", "hospitality"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Assembly Line",
                description: "Fully automated assembly line for electronics and automotive manufacturing.",
                category: "logistics",
                price: 120000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&q=80"],
                stock: 3,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["assembly", "automation", "electronics", "automotive"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Filtration System",
                description: "Advanced filtration system for air and liquid purification in industrial settings.",
                category: "logistics",
                price: 18000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 16,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["filtration", "purification", "air", "liquid"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Freezer Unit",
                description: "Large commercial freezer unit for food storage and preservation in retail settings.",
                category: "warehousing",
                price: 7800,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1519564540121-5b1a1e073bc3?auto=format&fit=crop&q=80"],
                stock: 19,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["freezer", "commercial", "food", "preservation"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Press Machine",
                description: "High-force industrial press machine for metal forming and molding applications.",
                category: "logistics",
                price: 48000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504672281656-e4981d70514d?auto=format&fit=crop&q=80"],
                stock: 9,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["press", "machine", "metal", "forming"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Labeling Machine",
                description: "High-speed automated labeling machine for product packaging and identification.",
                category: "logistics",
                price: 15000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 14,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["labeling", "automation", "packaging", "identification"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Coffee Roaster",
                description: "Large-capacity commercial coffee roaster for cafes and coffee shops.",
                category: "warehousing",
                price: 12500,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80"],
                stock: 13,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["coffee", "roaster", "commercial", "cafe"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Dryer System",
                description: "High-capacity industrial dryer system for textile and manufacturing processes.",
                category: "logistics",
                price: 26000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504148455447-3bc3e3e0e1c4?auto=format&fit=crop&q=80"],
                stock: 11,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["dryer", "industrial", "textile", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Warehouse Crane",
                description: "Overhead crane system for automated warehouse material handling and storage.",
                category: "warehousing",
                price: 68000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1595142884931-6fc94f715e57?auto=format&fit=crop&q=80"],
                stock: 5,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["crane", "warehouse", "automation", "handling"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Centrifuge",
                description: "High-speed industrial centrifuge for separation processes in laboratories and manufacturing.",
                category: "logistics",
                price: 32000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80"],
                stock: 8,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["centrifuge", "separation", "laboratory", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Deep Fryer",
                description: "Heavy-duty commercial deep fryer for restaurants and food service operations.",
                category: "warehousing",
                price: 3800,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 25,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["fryer", "commercial", "restaurant", "food"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Soldering Station",
                description: "Precision automated soldering station for electronics manufacturing and repair.",
                category: "logistics",
                price: 24000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1534030507896-1b4b961de23f?auto=format&fit=crop&q=80"],
                stock: 10,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["soldering", "automation", "electronics", "manufacturing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Boiler System",
                description: "High-efficiency industrial boiler system for steam generation in manufacturing processes.",
                category: "logistics",
                price: 55000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504148455447-3bc3e3e0e1c4?auto=format&fit=crop&q=80"],
                stock: 6,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["boiler", "steam", "industrial", "manufacturing"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Pasta Extruder",
                description: "Professional pasta extruder for commercial kitchens and food production facilities.",
                category: "warehousing",
                price: 8900,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80"],
                stock: 17,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["pasta", "extruder", "commercial", "kitchen"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Packaging Robot",
                description: "Robotic packaging system for high-speed product packaging and sealing.",
                category: "logistics",
                price: 42000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1534030507896-1b4b961de23f?auto=format&fit=crop&q=80"],
                stock: 7,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["packaging", "robot", "automation", "sealing"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Grinder Machine",
                description: "Heavy-duty industrial grinder for material processing and surface preparation.",
                category: "logistics",
                price: 18000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1504672281656-e4981d70514d?auto=format&fit=crop&q=80"],
                stock: 15,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["grinder", "industrial", "processing", "surface"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Steam Cooker",
                description: "Large commercial steam cooker for institutional food service and catering.",
                category: "warehousing",
                price: 7200,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 20,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["steamer", "commercial", "cooker", "catering"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Conveyor Sorter",
                description: "Intelligent conveyor sorter for automated package routing and distribution.",
                category: "logistics",
                price: 75000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1595142884931-6fc94f715e57?auto=format&fit=crop&q=80"],
                stock: 4,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["conveyor", "sorter", "automation", "distribution"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Spray Booth",
                description: "Enclosed spray booth for painting and coating applications with ventilation system.",
                category: "logistics",
                price: 28000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 9,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["spray", "booth", "painting", "coating"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Ice Cream Machine",
                description: "Professional ice cream machine for commercial food service and retail operations.",
                category: "warehousing",
                price: 11500,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80"],
                stock: 12,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["ice", "cream", "machine", "commercial"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Quality Inspection System",
                description: "Vision-based quality inspection system for automated defect detection in manufacturing.",
                category: "logistics",
                price: 58000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1534030507896-1b4b961de23f?auto=format&fit=crop&q=80"],
                stock: 6,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["inspection", "quality", "automation", "defect"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Homogenizer",
                description: "High-pressure homogenizer for particle size reduction in food and pharmaceutical processing.",
                category: "logistics",
                price: 38000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80"],
                stock: 8,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["homogenizer", "particle", "food", "pharmaceutical"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Waffle Maker",
                description: "Professional waffle maker for commercial food service and catering operations.",
                category: "warehousing",
                price: 2800,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 30,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["waffle", "maker", "commercial", "food"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Pick-and-Place Robot",
                description: "Precision pick-and-place robot for electronic component assembly and manufacturing.",
                category: "logistics",
                price: 45000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1534030507896-1b4b961de23f?auto=format&fit=crop&q=80"],
                stock: 7,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["pick", "place", "robot", "electronics"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Sterilizer",
                description: "High-temperature sterilizer for medical equipment and laboratory instrument sanitization.",
                category: "logistics",
                price: 32000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80"],
                stock: 10,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["sterilizer", "medical", "sanitization", "laboratory"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Pizza Oven",
                description: "High-temperature commercial pizza oven for restaurants and pizzerias.",
                category: "warehousing",
                price: 9800,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80"],
                stock: 16,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["pizza", "oven", "commercial", "restaurant"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Picking System",
                description: "Robotic picking system for automated order fulfillment in warehouses.",
                category: "warehousing",
                price: 62000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1595142884931-6fc94f715e57?auto=format&fit=crop&q=80"],
                stock: 5,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["picking", "automation", "fulfillment", "warehouse"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Mixer Blender",
                description: "Heavy-duty industrial mixer blender for chemical and food processing applications.",
                category: "logistics",
                price: 24000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 11,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["mixer", "blender", "industrial", "processing"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Griddle Grill",
                description: "Large commercial griddle grill for restaurants and food service operations.",
                category: "warehousing",
                price: 5600,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 22,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["griddle", "grill", "commercial", "restaurant"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Automated Case Erector",
                description: "Automatic case erecting machine for packaging and shipping operations.",
                category: "logistics",
                price: 18000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1581092584514-521d6c4bfef9?auto=format&fit=crop&q=80"],
                stock: 13,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["case", "erector", "automation", "packaging"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Industrial Vacuum Chamber",
                description: "High-vacuum chamber for scientific research and industrial processes.",
                category: "logistics",
                price: 48000,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80"],
                stock: 7,
                location: { city: "Jinan", state: "Shandong", country: "China" },
                tags: ["vacuum", "chamber", "research", "industrial"],
                seller: s1._id,
                isActive: true,
                isVerified: true
            },
            {
                name: "Commercial Popcorn Machine",
                description: "Professional popcorn machine for concession stands and entertainment venues.",
                category: "warehousing",
                price: 1800,
                currency: "USD",
                images: ["https://images.unsplash.com/photo-1596726891621-70039e7aa8f3?auto=format&fit=crop&q=80"],
                stock: 35,
                location: { city: "Qingzhou", state: "Shandong", country: "China" },
                tags: ["popcorn", "machine", "commercial", "concession"],
                seller: s2._id,
                isActive: true,
                isVerified: true
            }
        ];

        // 3. Insert Products
        for (const pData of productList) {
            const exists = await Product.findOne({
                name: pData.name,
                seller: pData.seller
            });

            if (!exists) {
                await Product.create(pData);
                const sellerName = pData.seller.equals(s1._id) ? s1.name : s2.name;
                console.log(`+ Product "${pData.name}" added for seller "${sellerName}".`);
            } else {
                console.log(`- Product "${pData.name}" for this seller already exists. Skipping.`);
            }
        }

        console.log("\nSEEDING PROCESS FINISHED.");
        process.exit(0);

    } catch (err) {
        console.error("CRITICAL SEED ERROR:", err);
        process.exit(1);
    }
};

const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';

mongoose.connect(DB_URI)
    .then(() => seedDB())
    .catch(err => console.error("Connection Error:", err));