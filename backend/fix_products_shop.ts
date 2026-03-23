import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, Shop } from './models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sanketsatras5055_db_user:wr0C6VTGnbeFka5Q@cluster0.937e8sl.mongodb.net/grofast?retryWrites=true&w=majority&appName=Cluster0';

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB...');

        const products = await Product.find();
        console.log(`Found ${products.length} products to update.`);

        for (const p of products) {
            const shop = await Shop.findOne({ vendorId: p.vendorId });
            if (shop) {
                p.shopName = shop.name;
                p.shopLocation = shop.location;
                await p.save();
                console.log(`Updated product ${p.name} with shop ${shop.name}`);
            } else {
                console.log(`No shop found for product ${p.name} (Vendor ID: ${p.vendorId})`);
            }
        }

        console.log('Finished updating products.');
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
}

fix();
