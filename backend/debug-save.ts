import mongoose from 'mongoose';
import { Order } from './models';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const order = new Order({
        id: 'ORD-TEST123',
        status: 'out_for_delivery',
        deliveryBoy: {
            id: 'test-del-123',
            name: 'Test Name',
            phone: 'Test Phone'
        }
    });
    const saved = await order.save();
    console.log("Saved order deliveryBoy:", JSON.stringify(saved.toObject().deliveryBoy, null, 2));
    
    // Now simulate the PATCH route
    const updateData: any = { status: 'delivered' };
    updateData.deliveryBoy = {
        id: 'test-del-456',
        name: 'Updated Name',
        phone: 'Updated Phone'
    };
    
    const updated = await Order.findOneAndUpdate({ id: 'ORD-TEST123' }, updateData, { new: true });
    console.log("Updated order deliveryBoy:", JSON.stringify(updated?.toObject().deliveryBoy, null, 2));
    
    await Order.deleteOne({ id: 'ORD-TEST123' });
    process.exit(0);
};
run().catch(console.error);
