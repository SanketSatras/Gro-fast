
import mongoose from 'mongoose';
import { Product, Shop, ProductRequest } from './models';

const MONGODB_URI = 'mongodb+srv://sanketsatras5055_db_user:wr0C6VTGnbeFka5Q@cluster0.937e8sl.mongodb.net/grofast?retryWrites=true&w=majority&appName=Cluster0';

async function checkData() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const shops = await Shop.find();
    console.log('--- SHOPS ---');
    shops.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}, VendorID: ${s.vendorId}`));

    const products = await Product.find();
    console.log('\n--- PRODUCTS ---');
    products.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}, VendorID: ${p.vendorId}, Approved: ${p.isApproved}`));

    const requests = await ProductRequest.find();
    console.log('\n--- REQUESTS ---');
    requests.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, VendorID: ${r.vendorId}, Status: ${r.status}`));

    await mongoose.disconnect();
}

checkData().catch(console.error);
