const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', OrderSchema, 'orders');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find().sort({ _id: -1 }).limit(20);
        console.log("Total orders found:", orders.length);
        orders.forEach(o => {
            console.log(`Order: ${o.id}, Phone: ${o.customer?.phone}, Name: ${o.customer?.name}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
