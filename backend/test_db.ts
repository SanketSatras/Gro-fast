import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log('Testing connection to:', MONGODB_URI?.split('@')[1]); // Log without credentials
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err);
        process.exit(1);
    }
}

testConnection();
