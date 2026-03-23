import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkConnectivity() {
    console.log('\n--- GROFAST Connectivity Diagnostic ---\n');

    // 1. Get Public IP
    try {
        console.log('Fetching public IP address...');
        const response = await axios.get('https://ifconfig.me/ip', { timeout: 5000 });
        const ip = response.data.trim();
        console.log(`✅ Current Public IP: ${ip}`);
        console.log('\n----------------------------------------');
        console.log('IMPORTANT: Please ensure this IP is whitelisted in your MongoDB Atlas Network Access.');
        console.log('Link: https://cloud.mongodb.com/v2/ (Go to Network Access -> Add IP Address)');
        console.log('----------------------------------------\n');
    } catch (error) {
        console.error('❌ Failed to fetch public IP. Are you connected to the internet?');
    }

    // 2. Test MongoDB Connection
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing in .env file.');
        return;
    }

    console.log('Attempting to connect to MongoDB Atlas...');
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Wait 5 seconds only
        });
        console.log('✅ Success! Successfully connected to MongoDB Atlas.');
        await mongoose.disconnect();
    } catch (err: any) {
        console.log('\n❌ Connection Failed.');
        if (err.message.includes('IP not whitelisted') || err.name === 'MongooseServerSelectionError') {
            console.log('\n--- RECOMMENDED ACTION ---');
            console.log('This error usually means your IP is NOT whitelisted.');
            console.log('1. Log in to MongoDB Atlas.');
            console.log('2. Go to "Network Access" in the sidebar.');
            console.log('3. Click "Add IP Address".');
            console.log('4. Add your IP (shown above) or click "Allow Access from Anywhere" (for testing).');
        } else {
            console.error('Error Details:', err.message);
        }
    }
}

checkConnectivity();
