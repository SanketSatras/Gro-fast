import express, { Request, Response, NextFunction } from 'express';
import cluster from 'cluster';
import os from 'os';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { User, Product, Order, Shop, ProductRequest, SystemLog } from './models';
import { whatsappManager } from './whatsapp';
import helmet from 'helmet';
import logger from './logger';

dotenv.config();

// Helper to create system logs
const createLog = async (type: 'product' | 'shop' | 'order' | 'user' | 'system', action: string, target: string = 'Unknown', performedBy: string = 'System', details?: string) => {
    try {
        const timestamp = new Date();
        const logId = 'LOG-' + timestamp.getTime() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        const log = new SystemLog({
            id: logId,
            type,
            action,
            target,
            performedBy,
            details,
            timestamp
        });
        await log.save();
        logger.info(`[SystemLog] ${type.toUpperCase()} | ${action} | ${target} by ${performedBy}`);
    } catch (error) {
        logger.error('[SystemLog] Error creating log:', error);
    }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Enforce environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!JWT_SECRET || !MONGODB_URI) {
    logger.error('CRITICAL ERROR: Missing JWT_SECRET or MONGODB_URI environment variables.');
    process.exit(1);
}

// Custom NoSQL Injection Protection
const sanitize = (data: any) => {
    if (data instanceof Object) {
        for (const key in data) {
            if (key.startsWith('$')) {
                delete data[key];
            } else {
                sanitize(data[key]);
            }
        }
    }
    return data;
};

app.use(helmet()); // Security headers
app.use(cookieParser());
app.use((req, res, next) => {
    if (req.body) sanitize(req.body);
    if (req.query) {
        // Clone and sanitize since req.query might be read-only
        const sanitizedQuery = sanitize(JSON.parse(JSON.stringify(req.query)));
        for(const key in req.query) {
            if(key.startsWith('$')) {
                return res.status(400).json({ message: 'Invalid characters in request' });
            }
        }
    }
    next();
});

app.use(cors({
    origin: (origin, callback) => {
        const allowedLinks = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
            'http://localhost:5173', 
            'http://localhost:8080', 
            'http://127.0.0.1:5173', 
            'http://127.0.0.1:8080',
            'http://localhost:3000',
            'http://localhost:5000'
        ];
        
        const isAllowed = !origin || allowedLinks.includes(origin) || origin.endsWith('.pages.dev');
        logger.info(`CORS Check - Origin: ${origin}, Allowed: ${isAllowed}`);
        
        if (isAllowed) {
            callback(null, true);
        } else {
            logger.warn(`CORS Blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body limit to prevent DOS

// Label requests with worker ID for observability
app.use((req: Request, res: Response, next: NextFunction) => {
    if (cluster.isWorker) {
        logger.info(`[Worker ${process.pid}] ${req.method} ${req.url}`);
    }
    next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// --- RATE LIMITING ---
// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (per worker)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Stricter limiter for authentication/sensitive routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, // Limit each IP to 10 requests per 15 mins (per worker)
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Apply rate limiters
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// --- AUTH MIDDLEWARE ---
const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token = req.cookies?.token;

    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const authorize = (roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

// MongoDB Connection
const connectDB = async (retries = 3) => {
    while (retries > 0) {
        try {
            await mongoose.connect(MONGODB_URI as string, {
                serverSelectionTimeoutMS: 5000, // 5 seconds timeout
                connectTimeoutMS: 10000,       // 10 seconds connect timeout
            });
            logger.info('Connected to MongoDB');
            return;
        } catch (err) {
            retries--;
            logger.error(`MongoDB connection error (Attempts left: ${retries}):`, err);
            if (retries === 0) {
                logger.error('CRITICAL: Failed to connect to MongoDB after multiple attempts. Application may not function correctly.');
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retry
            }
        }
    }
};

// --- AUTH ROUTES ---
const validatePassword = (pw: string) => {
    // Min 8 chars, 1 uppercase, 1 number, 1 special character
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[!@#$%^&*(),.?":{}|<>]/.test(pw);
};

const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@gmail.com');
};

const validatePhone = (phone: string) => {
    return /^\+91\d{10}$/.test(phone);
};

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password, role, shopName, shopLocation, shopCategory } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Only @gmail.com email addresses are allowed' });
        }

        if (!validatePhone(phone)) {
            return res.status(400).json({ message: 'Phone must be in +91XXXXXXXXXX format (10 digits)' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be 8+ chars, include uppercase, number, and a special symbol' });
        }
// ...

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            id: 'u' + Date.now(),
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'customer'
        });

        await newUser.save();

        if (role === 'vendor' && shopName) {
            const newShop = new Shop({
                id: 's' + Date.now(),
                vendorId: newUser.id,
                name: shopName,
                location: shopLocation || 'Update your location',
                category: shopCategory || 'General',
                distance: '0 km',
                rating: 5.0,
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop',
                isOpen: true
            });
            await newShop.save();
        }

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET);
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({ ...userWithoutPassword, token });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hardcoded admin access per user request
        if (email === 'sanket@gmail.com' && password === '12345') {
            const token = jwt.sign({ id: 'admin-sanket', role: 'admin' }, JWT_SECRET);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            return res.json({
                id: 'admin-sanket',
                name: 'Sanket',
                email: 'sanket@gmail.com',
                role: 'admin',
                token
            });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
        const { password: _, ...userWithoutPassword } = user.toObject();
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({ ...userWithoutPassword, token });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Secure Password Reset Flow
app.post('/api/auth/reset-password/request', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        (user as any).resetOtp = otp;
        (user as any).resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        logger.info(`[SECURITY] Password reset OTP for ${email}: ${otp}`);
        await createLog('user', 'password_reset_requested', email, 'Guest', 'OTP generated and logged');
        
        res.json({ message: 'Verification code sent (check server logs)' });
    } catch (error) {
        logger.error('Error requesting reset:', error);
        res.status(500).json({ message: 'Error requesting reset' });
    }
});

app.post('/api/auth/reset-password/verify', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || (user as any).resetOtp !== otp || new Date() > (user as any).resetOtpExpiry) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'New password does not meet requirements' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        (user as any).resetOtp = undefined;
        (user as any).resetOtpExpiry = undefined;
        await user.save();

        await createLog('user', 'password_reset_completed', email, 'Guest');
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying reset' });
    }
});

app.patch('/api/auth/profile', verifyToken, async (req: any, res) => {
    try {
        const { id, name, email, phone, preferences, password } = req.body;
        
        // Security Check: Only allow users to update their own profile
        if (req.user.id !== id) {
            return res.status(403).json({ message: 'You can only update your own profile' });
        }

        // Validate updates if provided
        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: 'Only @gmail.com email addresses are allowed' });
        }
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ message: 'Phone must be in +91XXXXXXXXXX format (10 digits)' });
        }
        if (password && !validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be 8+ chars, include uppercase, number, and a special symbol' });
        }

        // Check if email is already in use by ANOTHER user
        if (email) {
            const existingUser = await User.findOne({ email, id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updates: any = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (preferences) updates.preferences = preferences;
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findOneAndUpdate({ id }, updates, { returnDocument: 'after' });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

app.post('/api/auth/addresses', verifyToken, async (req: any, res) => {
    try {
        const { userId, address } = req.body;
        
        // Security Check: Only allow users to add addresses to their own account
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newAddress = { ...address, id: 'addr_' + Date.now() };
        (user as any).addresses.push(newAddress);
        await user.save();
        res.json(newAddress);
    } catch (error) {
        res.status(500).json({ message: 'Error adding address' });
    }
});

app.delete('/api/auth/addresses/:userId/:addressId', verifyToken, async (req: any, res) => {
    try {
        const { userId, addressId } = req.params;

        // Security Check: Only allow users to delete their own addresses
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        (user as any).addresses = (user as any).addresses.filter((a: any) => a.id !== addressId);
        await user.save();
        res.json({ message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting address' });
    }
});

// --- SHOPS ---
app.get('/api/shops', async (req, res) => {
    try {
        const shops = await Shop.find();
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shops' });
    }
});

app.get('/api/shops/vendor/:vendorId', verifyToken, async (req: any, res) => {
    try {
        const { vendorId } = req.params;
        
        // Security Check: Vendors can only see their own shop info
        if (req.user.role === 'vendor' && req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const shop = await Shop.findOne({ vendorId });
        res.json(shop || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor shop' });
    }
});

app.patch('/api/shops/vendor/:vendorId', verifyToken, authorize(['vendor', 'admin']), async (req: any, res) => {
    try {
        const { vendorId } = req.params;
        const { name, location } = req.body;
        
        // Security Check: Only the vendor or admin can update
        if (req.user.role === 'vendor' && req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const shop = await Shop.findOneAndUpdate(
            { vendorId },
            { name, location },
            { returnDocument: 'after' }
        );
        
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        await createLog('shop', 'updated', shop.name || vendorId, req.user.id, `Name: ${name}, Location: ${location}`);
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: 'Error updating shop' });
    }
});

app.post('/api/shops', verifyToken, authorize(['vendor', 'admin']), async (req: any, res) => {
    try {
        const { id, vendorId, name, location, category, image } = req.body;

        // Security Check: Vendor can only create for themselves
        if (req.user.role === 'vendor' && req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const existingShop = await Shop.findOne({ vendorId });
        if (existingShop) {
            return res.status(400).json({ message: 'Vendor already has a shop' });
        }
// ...

        const newShop = new Shop({
            id: id || 's' + Date.now(),
            vendorId,
            name,
            location,
            category: category || 'General',
            image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop',
            distance: '0 km',
            rating: 5.0,
            isOpen: true
        });

        await newShop.save();
        res.status(201).json(newShop);
    } catch (error) {
        res.status(500).json({ message: 'Error creating shop' });
    }
});

app.delete('/api/shops/:id', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        // ... (remaining deletion logic is safe due to authorize(['admin']))
        console.log(`\n--- DELETE SHOP ATTEMPT ---`);
        console.log(`Search ID from URL: "${id}"`);
        
        // Find shop by custom id OR MongoDB _id
        const shop = await Shop.findOne({ 
            $or: [
                { id: id },
                { _id: mongoose.Types.ObjectId.isValid(id) ? id : new mongoose.Types.ObjectId() }
            ]
        });

        if (!shop) {
            logger.warn(`[FAIL] Shop not found for ID: ${id}`);
            const allShops = await Shop.find({}, { id: 1, name: 1 });
            logger.info(`Available shops in DB: ${JSON.stringify(allShops.map(s => ({ id: s.id, name: s.name, _id: s._id })))}`);
            return res.status(404).json({ message: 'Shop not found' });
        }

        logger.info(`[FOUND] Shop: "${shop.name}" (Custom ID: ${shop.id}, DB ID: ${shop._id})`);
        const vendorId = shop.vendorId;
        const shopDbId = shop._id;

        // Delete shop
        await Shop.findByIdAndDelete(shopDbId);
        console.log(`[DONE] Shop document deleted.`);

        // Delete products
        const productResult = await Product.deleteMany({ vendorId });
        console.log(`[DONE] Deleted ${productResult.deletedCount} products associated with vendor ${vendorId}`);
        
        // Delete requests
        const requestResult = await ProductRequest.deleteMany({ vendorId });
        console.log(`[DONE] Deleted ${requestResult.deletedCount} requests associated with vendor ${vendorId}`);

        if (shop) {
            await createLog('shop', 'deleted', shop.name || id, 'Admin', `Shop ID: ${id}`);
        }
        res.json({ 
            message: 'Shop and associated data deleted successfully',
            deletedCount: {
                products: productResult.deletedCount,
                requests: requestResult.deletedCount
            }
        });
    } catch (error) {
        logger.error('[ERROR] Shop deletion failed:', error);
        res.status(500).json({ message: 'Error deleting shop' });
    }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.get('/api/products/requests', verifyToken, authorize(['admin', 'vendor']), async (req: any, res) => {
    try {
        let query = {};
        if (req.user.role === 'vendor') {
            query = { vendorId: req.user.id };
        }
        const requests = await ProductRequest.find(query);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

app.post('/api/products/request', verifyToken, authorize(['vendor']), async (req: any, res) => {
    try {
        const { vendorId } = req.body;
        
        // Security Check: Vendor can only request for themselves
        if (req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const shop = await Shop.findOne({ vendorId });

        const request = new ProductRequest({
            ...req.body,
            id: 'r' + Date.now(),
            status: 'pending',
            shopName: shop?.name || 'Unknown Shop',
            shopLocation: shop?.location || 'Unknown Location'
        });
        await request.save();
        await createLog('product', 'request_created', request.name || 'New Product', req.user.id, `Vendor: ${vendorId}`);
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product request' });
    }
});

app.patch('/api/products/requests/:id', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, image } = req.body;
// ...

        const request = await ProductRequest.findOne({ id });
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        await request.save();

        if (status === 'approved') {
            const productData = request.toObject();
            delete (productData as any)._id;
            delete (productData as any).__v;

            const approvedProduct = new Product({
                ...productData,
                id: 'p' + Date.now(),
                isApproved: true,
                stock: request.stock || 0,
                image: image || request.image,
                badges: ['fresh']
            });
            await approvedProduct.save();
            await createLog('product', 'approved', request.name || id, 'Admin', `Approved from request ${id}`);
        } else if (status === 'rejected') {
            await createLog('product', 'rejected', request.name || id, 'Admin', `Request ${id} rejected`);
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error updating request' });
    }
});

app.delete('/api/products/:id', verifyToken, authorize(['admin', 'vendor']), async (req: any, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findOne({ id });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Security Check: Vendors can only delete their own products
        if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: not your product' });
        }

        await Product.deleteOne({ id });
        await createLog('product', 'deleted', product.name || id, req.user.id, `Product ID: ${id}`);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

app.patch('/api/products/:id/stock', verifyToken, authorize(['vendor']), async (req: any, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        
        console.log(`[API] Stock update request for product ${id}: new stock ${stock}`);

        if (stock === undefined || typeof stock !== 'number') {
            return res.status(400).json({ message: 'Stock value is required and must be a number' });
        }

        // Try to find by custom id first, then by _id as fallback
        let product = await Product.findOne({ id });
        if (!product && mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id);
        }

        if (!product) {
            console.error(`[API] Product ${id} not found`);
            return res.status(404).json({ message: 'Product not found' });
        }

        // Security Check: Vendors can only update their own products
        if (product.vendorId !== req.user.id) {
            console.error(`[API] Access denied for vendor ${req.user.id} on product ${id}`);
            return res.status(403).json({ message: 'Access denied: not your product' });
        }

        product.stock = stock;
        await product.save();
        
        await createLog('product', 'stock_updated', product.name || id, req.user.id, `New Stock: ${stock}`);
        console.log(`[API] Stock updated successfully for ${id}`);
        res.json(product);
    } catch (error) {
        console.error('Stock update error:', error);
        res.status(500).json({ message: 'Error updating stock' });
    }
});

// --- WHATSAPP VENDOR API ---
app.get('/api/vendor/whatsapp/status/:vendorId', (req, res) => {
    const { vendorId } = req.params;
    const status = whatsappManager.getStatus(vendorId);
    res.json(status);
});

app.post('/api/vendor/whatsapp/connect/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        const engine = await whatsappManager.getEngine(vendorId);
        res.json({ message: 'WhatsApp initialization started', status: engine.getStatus() });
    } catch (error) {
        res.status(500).json({ message: 'Error initializing WhatsApp' });
    }
});

// --- ORDERS ---
app.get('/api/orders', verifyToken, async (req: any, res) => {
    try {
        const { vendorId, role, userId } = req.query;
        let query: any = {};

        // Security Check: Enforce user context from JWT
        if (req.user.role === 'vendor') {
            query.vendorId = req.user.id; // Corrected: Use authenticated user's ID
        } else if (req.user.role === 'customer' || req.user.role === 'user') {
            query.userId = req.user.id; // Enforce: Customers only see their own orders
        } else if (req.user.role === 'delivery') {
            // Delivery boys see orders that are ready for pickup (preparing) or already claimed by them
            query.$or = [
                { status: 'preparing' },
                { 'deliveryBoy.id': req.user.id }
            ];
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized role access' });
        }

        const orders = await Order.find(query);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

app.get('/api/orders/:id', verifyToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // Security Check: Only customer or assigned vendor can view
        if (req.user.role !== 'admin' && order.userId !== req.user.id && order.vendorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: not your order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

app.post('/api/orders', verifyToken, async (req: any, res) => {
    try {
        const items = req.body.items || [];
        
        // --- Stock Validation ---
        for (const item of items) {
            const product = await Product.findOne({ id: item.id });
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name || item.id} not found` });
            }
            if ((product.stock || 0) < (item.quantity || 0)) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock || 0}, Requested: ${item.quantity}` 
                });
            }
        }

        const order = new Order({
            ...req.body,
            id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            status: 'pending',
            userId: req.user.id // Enforce: Order belongs to the authenticated user
        });

        // Update product stock
        for (const item of order.items) {
            const quantity = item.quantity || 0;
            await Product.findOneAndUpdate(
                { id: item.id },
                { $inc: { stock: -quantity } }
            );
        }

        await order.save();
        await createLog('order', 'placed', order.id || 'Unknown', req.user.id, `Total: ₹${order.total}`);
        logger.info(`[Order] Order ${order.id} saved. Starting WhatsApp notifications for vendor ${order.vendorId}...`);
        
        // Send WhatsApp Notifications using Vendor's engine
        whatsappManager.getEngine(order.vendorId as string).then(async engine => {
            const status = engine.getStatus();
            logger.info(`[Order] Found engine for ${order.vendorId}. Ready: ${status.isReady}`);
            
            // Fetch shop name for notification
            let shopName = 'Our Shop';
            try {
                const shop = await Shop.findOne({ vendorId: order.vendorId });
                if (shop) shopName = shop.name;
            } catch (err) {
                logger.error('[Order] Error fetching shop name for WhatsApp:', err);
            }

            // 1. Notify Customer
            engine.sendOrderSuccess(order, shopName).catch(err => logger.error(`[Order] WhatsApp customer notification error for ${order.id}:`, err));
            
            // 2. Notify Vendor (on their own number)
            try {
                const vendor = await User.findOne({ id: order.vendorId });
                logger.info(`[Order] Found vendor ${vendor?.name} for notification. Phone: ${vendor?.phone}`);
                if (vendor?.phone) {
                    engine.sendNewOrderToVendor(order, vendor.phone).catch(err => logger.error(`[Order] WhatsApp vendor notification error for ${order.id}:`, err));
                }
            } catch (err) {
                logger.error(`[Order] Error fetching vendor for notification for ${order.id}:`, err);
            }
        }).catch(err => logger.error(`[Order] Error getting vendor whatsapp engine for ${order.vendorId}:`, err));

        res.status(201).json(order);
    } catch (error) {
        logger.error('Order creation error:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

app.patch('/api/orders/:id/status', verifyToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const updateData: any = { status };
        
        // If a delivery partner claims or marks an order as delivered, bind their ID to it
        if (req.user.role === 'delivery' && (status === 'out_for_delivery' || status === 'delivered')) {
            updateData.deliveryBoy = {
                id: req.user.id,
                name: req.user.name,
                phone: req.user.phone
            };
        }

        const order = await Order.findOneAndUpdate({ id }, updateData, { returnDocument: 'after' });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // WhatsApp Notification Logic using Vendor's engine
        whatsappManager.getEngine(order.vendorId as string).then(async engine => {
            if (status === 'delivered') {
                engine.sendOrderDelivered(order).catch(err => logger.error('WhatsApp delivery notification error:', err));
            } else if (status === 'cancelled') {
                const shop = await Shop.findOne({ vendorId: order.vendorId });
                const vendor = await User.findOne({ id: order.vendorId });
                engine.sendOrderCancelled(
                    order, 
                    shop?.name || 'Grofast Partner', 
                    vendor?.phone || 'Contact Support',
                    reason || 'Vendor unavailable'
                ).catch(err => logger.error('WhatsApp cancellation notification error:', err));
            }
        }).catch(err => logger.error('Error getting vendor whatsapp engine for status update:', err));

        await createLog('order', 'status_updated', order.id || id, 'System/Vendor', `Status changed to ${status}`);
        res.json(order);
    } catch (error) {
        logger.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

app.patch('/api/orders/:id/location', verifyToken, authorize(['vendor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { location } = req.body; // { lat, lng }

        const order = await Order.findOneAndUpdate(
            { id },
            { 'deliveryBoy.location': location },
            { returnDocument: 'after' }
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order location' });
    }
});

// --- ADMIN LOGS ---
app.get('/api/admin/logs', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const logs = await SystemLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs' });
    }
});

const startServer = async () => {
    await connectDB();
    // WhatsApp engines are now initialized per-vendor on demand
    const PORT_NUM = parseInt(PORT.toString(), 10) || 5000;
    app.listen(PORT_NUM, '0.0.0.0', () => {
        logger.info(`Worker ${process.pid} started and listening on 0.0.0.0:${PORT_NUM}`);
    });
};

startServer();
