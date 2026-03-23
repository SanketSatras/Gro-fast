
import mongoose from 'mongoose';
import { Product } from './models';

const MONGODB_URI = 'mongodb+srv://sanketsatras5055_db_user:wr0C6VTGnbeFka5Q@cluster0.937e8sl.mongodb.net/grofast?retryWrites=true&w=majority&appName=Cluster0';

const GREEN_MART_VENDOR_ID = 'u1772876675750';

const mockProducts = [
    {
        id: 'p_gm_1',
        name: 'Fresh Milk 1L',
        price: 60,
        image: 'https://images.unsplash.com/photo-1563636619-e9107da6a7ac?w=800&fit=crop',
        category: 'Dairy',
        badges: ['fresh'],
        stock: 50,
        unit: '1 Litre',
        vendorId: GREEN_MART_VENDOR_ID,
        shopName: 'Green Mart',
        shopLocation: 'pune',
        isApproved: true,
        rating: 4.8
    },
    {
        id: 'p_gm_2',
        name: 'Paneer 200g',
        price: 90,
        image: 'https://5.imimg.com/data5/SELLER/Default/2023/10/357240080/PA/CL/CR/6974227/81hd14mn91l.jpg',
        category: 'Dairy',
        badges: ['fresh', 'local'],
        stock: 30,
        unit: '200g',
        vendorId: GREEN_MART_VENDOR_ID,
        shopName: 'Green Mart',
        shopLocation: 'pune',
        isApproved: true,
        rating: 4.9
    },
    {
        id: 'p_gm_3',
        name: 'Curd 500g',
        price: 45,
        image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=800&fit=crop',
        category: 'Dairy',
        badges: ['fresh'],
        stock: 40,
        unit: '500g',
        vendorId: GREEN_MART_VENDOR_ID,
        shopName: 'Green Mart',
        shopLocation: 'pune',
        isApproved: true,
        rating: 4.7
    }
];

async function seedProducts() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const p of mockProducts) {
        await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true });
        console.log(`Seeded/Updated product: ${p.name}`);
    }

    await mongoose.disconnect();
    console.log('Seeding complete.');
}

seedProducts().catch(console.error);
