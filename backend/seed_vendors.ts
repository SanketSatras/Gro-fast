import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Shop, Product } from './models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sanketsatrass2005_db_user:fb9K8Acldg6E3Ena@cluster0.sejnrhy.mongodb.net/?appName=Cluster0";

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for Seeding Vendors...');

        // Clear existing data to avoid duplicates (Optional, but cleaner for a fresh start)
        await User.deleteMany({ role: 'vendor' });
        await Shop.deleteMany({});
        await Product.deleteMany({});

        const vendors = [
            {
                name: 'Green Farms Admin',
                email: 'green@grofast.com',
                password: 'pass1234',
                role: 'vendor',
                shop: {
                    id: 's1',
                    name: 'Green Farms Organic',
                    location: 'Amravati Road, Nagpur',
                    distance: '1.2 km',
                    rating: 4.8,
                    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop',
                    isOpen: true,
                    category: 'Groceries'
                }
            },
            {
                name: 'Dairy Delight Admin',
                email: 'dairy@grofast.com',
                password: 'pass1234',
                role: 'vendor',
                shop: {
                    id: 's2',
                    name: 'Dairy Delight Hub',
                    location: 'Civil Lines, Nagpur',
                    distance: '2.5 km',
                    rating: 4.5,
                    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&fit=crop',
                    isOpen: true,
                    category: 'Dairy'
                }
            },
            {
                name: 'GROFAST Admin',
                email: 'shiv@grofast.com',
                password: 'pass1234',
                role: 'vendor',
                shop: {
                    id: 's3',
                    name: "GROFAST Official",
                    location: 'Update your location',
                    distance: '0 km',
                    rating: 5.0,
                    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop', // Placeholder
                    isOpen: true,
                    category: 'General'
                }
            }
        ];

        for (const vData of vendors) {
            const hashedPassword = await bcrypt.hash(vData.password, 10);
            const user = new User({
                id: 'v' + Date.now() + Math.random().toString(36).substr(2, 5),
                name: vData.name,
                email: vData.email,
                password: hashedPassword,
                role: vData.role
            });
            await user.save();

            console.log(`Created Vendor User: ${vData.email}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
