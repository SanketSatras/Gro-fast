import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Shop, Product, ProductRequest } from './models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnose() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB for diagnosis...');

        const users = await User.find();
        console.log('\n--- All Users ---');
        users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u.id}`));

        const shops = await Shop.find();
        console.log('\n--- All Shops ---');
        shops.forEach(s => console.log(`Name: ${s.name}, Location: ${s.location}, VendorID: ${s.vendorId}, ID: ${s.id}`));

        const products = await Product.find();
        console.log('\n--- Approved Products ---');
        products.forEach(p => console.log(`Name: ${p.name}, VendorID: ${p.vendorId}, Approved: ${p.isApproved}`));

        const requests = await ProductRequest.find();
        console.log('\n--- Product Requests ---');
        requests.forEach(r => console.log(`Name: ${r.name}, VendorID: ${r.vendorId}, Status: ${r.status}`));

        process.exit(0);
    } catch (error) {
        console.error('Diagnosis failed:', error);
        process.exit(1);
    }
}

diagnose();
