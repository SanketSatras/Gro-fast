import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Shop, Product, ProductRequest } from './models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sanketsatras5055_db_user:wr0C6VTGnbeFka5Q@cluster0.937e8sl.mongodb.net/grofast?retryWrites=true&w=majority&appName=Cluster0';

async function del() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Delete "sanket's Shop" and the user named "sanket" (if it exists)
        const shop = await Shop.findOne({ name: /sanket/i });
        if (shop) {
            console.log(`Deleting shop: ${shop.name}`);
            await Shop.deleteOne({ _id: shop._id });
        }

        const user = await User.findOne({ name: /sanket/i });
        if (user) {
            console.log(`Deleting user: ${user.name}`);
            await User.deleteOne({ _id: user._id });
        }

        // delete rolex mart as well just in case they want a fresh start
        // wait the user said "if xyz@gmail.com create as vendeor acc" so they might want to keep the one they just created or start fresh.
        // the screenshot shows 'rolex mart' as the new one. I'll keep it. 
        // I only delete the "sanket's Shop" which had "Update your location".

        console.log('Finished cleanup.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

del();
