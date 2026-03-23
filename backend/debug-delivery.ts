import mongoose from 'mongoose';
import { Order } from './models';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const orders = await Order.find({ status: { $in: ['out_for_delivery', 'delivered'] } });
    console.log("Found orders:", orders.length);
    orders.forEach(o => {
        console.log(`Order ${o.id} - status: ${o.status}`);
        console.log(`  deliveryBoy:`, o.deliveryBoy);
    });
    process.exit(0);
};
run().catch(console.error);
