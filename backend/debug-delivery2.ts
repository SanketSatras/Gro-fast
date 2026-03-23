import mongoose from 'mongoose';
import { Order } from './models';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const orders = await Order.find({ status: { $in: ['out_for_delivery', 'delivered'] } });
    const result = orders.map(o => ({
        id: o.id,
        status: o.status,
        deliveryBoy: o.deliveryBoy
    }));
    fs.writeFileSync('delivery_debug_output.json', JSON.stringify(result, null, 2));
    process.exit(0);
};
run().catch(console.error);
