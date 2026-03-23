import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'vendor', 'customer', 'delivery'], default: 'customer' },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
    addresses: [{
        id: String,
        label: String, // Home, Office, etc.
        address: String,
        pincode: String,
        isDefault: { type: Boolean, default: false }
    }],
    preferences: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false }
    }
}, { shardKey: { id: 'hashed' } });

// Indexes for User
UserSchema.index({ role: 1 });
UserSchema.index({ phone: 1 });

const ProductSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    category: String,
    badges: [String],
    stock: { type: Number, default: 0 },
    unit: String,
    vendorId: String,
    shopName: String,
    shopLocation: String,
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 4.8 }
}, { shardKey: { vendorId: 1, id: 1 } });

// Indexes for Product
ProductSchema.index({ vendorId: 1, id: 1 });
ProductSchema.index({ category: 1, isApproved: 1 });
ProductSchema.index({ isApproved: 1 });
ProductSchema.index({ name: 'text', category: 'text' }); // Allow fast text search

const OrderSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    userId: String,
    vendorId: String,
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    total: Number,
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending' 
    },
    date: { type: Date, default: Date.now },
    customer: {
        name: String,
        phone: String,
        address: String,
        pincode: String
    },
    address: Object,
    paymentMethod: String,
    deliveryBoy: {
        id: String,
        name: String,
        phone: String,
        location: {
            lat: Number,
            lng: Number
        }
    }
}, { shardKey: { id: 'hashed' } });

// Indexes for Order
OrderSchema.index({ userId: 1 });
OrderSchema.index({ vendorId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ date: -1 }); // Default to sorting backwards for fast history loads

const ShopSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    vendorId: { type: String, required: true },
    name: { type: String, required: true },
    location: String,
    distance: String,
    rating: { type: Number, default: 5.0 },
    image: String,
    isOpen: { type: Boolean, default: true },
    category: String
}, { shardKey: { id: 'hashed' } });

// Indexes for Shop
ShopSchema.index({ vendorId: 1 });
ShopSchema.index({ isOpen: 1 });

const ProductRequestSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    price: Number,
    image: String,
    category: String,
    stock: Number,
    vendorId: String,
    shopName: String,
    shopLocation: String,
    status: { type: String, default: 'pending' },
    requestDate: { type: Date, default: Date.now }
}, { shardKey: { vendorId: 1, id: 1 } });

// Indexes for ProductRequest
ProductRequestSchema.index({ vendorId: 1 });
ProductRequestSchema.index({ status: 1 });
ProductRequestSchema.index({ requestDate: -1 });

export const User = mongoose.model('User', UserSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Order = mongoose.model('Order', OrderSchema);
export const Shop = mongoose.model('Shop', ShopSchema);
export const ProductRequest = mongoose.model('ProductRequest', ProductRequestSchema);

const SystemLogSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    type: { type: String, enum: ['product', 'shop', 'order', 'user', 'system'], required: true },
    action: { type: String, required: true }, // approved, rejected, deleted, updated
    target: String, // Name or ID of the affected item
    performedBy: String, // Admin name or ID
    details: String,
    timestamp: { type: Date, default: Date.now }
}, { shardKey: { id: 'hashed' } });

SystemLogSchema.index({ type: 1 });
SystemLogSchema.index({ timestamp: -1 });

export const SystemLog = mongoose.model('SystemLog', SystemLogSchema);
