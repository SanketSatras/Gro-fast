import { useState } from "react";
import { Link } from "react-router-dom";
import { useShops } from "@/hooks/useShops";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { BottomNav } from "@/components/marketplace/BottomNav";
import {
    ShoppingCart, Search, MapPin, ChevronDown, ChevronRight,
    Star, Clock, User, LogOut, Store, Zap
} from "lucide-react";
import { motion } from "framer-motion";

/* ─────────── DATA ─────────── */
const CATEGORIES = [
    { label: "Paan Corner", emoji: "🍃", bg: "#FFF3E0" },
    { label: "Dairy & Bread", emoji: "🥛", bg: "#E3F2FD" },
    { label: "Fruits & Veg", emoji: "🥦", bg: "#E8F5E9" },
    { label: "Cold Drinks", emoji: "🥤", bg: "#F3E5F5" },
    { label: "Snacks", emoji: "🍟", bg: "#FFF8E1" },
    { label: "Breakfast", emoji: "🥣", bg: "#FCE4EC" },
    { label: "Sweet Tooth", emoji: "🍫", bg: "#FBE9E7" },
    { label: "Bakery", emoji: "🥖", bg: "#F1F8E9" },
    { label: "Tea & Coffee", emoji: "☕", bg: "#FFF3E0" },
    { label: "Atta & Rice", emoji: "🌾", bg: "#F9FBE7" },
    { label: "Masala", emoji: "🌶️", bg: "#FFEBEE" },
    { label: "Cleaning", emoji: "🧹", bg: "#E0F7FA" },
];

const PROMO_BANNERS = [
    {
        bg: "linear-gradient(135deg, #1a5c3a 0%, #0f9d58 100%)",
        tag: "🛒 All Essentials",
        title: "All your needs\ndelivered fast!",
        sub: "Vegetables, fruits, pulses & daily essentials",
        cta: "Shop Now",
        link: "/category/all",
        img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=180&fit=crop",
    },
    {
        bg: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
        tag: "🥛 Dairy",
        title: "Farm-fresh dairy\nat your door",
        sub: "Milk, paneer, butter, curd & more",
        cta: "Order Now",
        link: "/category/dairy",
        img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=180&fit=crop",
    },
    {
        bg: "linear-gradient(135deg, #5d3a1a 0%, #c4813a 100%)",
        tag: "🥖 Bakery",
        title: "Freshly baked\nevery morning",
        sub: "Bread, muffins, cakes & pastries",
        cta: "Order Now",
        link: "/category/bakery",
        img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=180&fit=crop",
    },
];

/* ─────────── MAIN PAGE ─────────── */
const LocationSelection = () => {
    const [search, setSearch] = useState("");
    const { user, logout, isAuthenticated } = useAuth();
    const { shops, isLoading } = useShops();
    const cart = useCart();

    const sortedShops = [...shops].sort((a, b) => b.id.localeCompare(a.id));

    const filtered = sortedShops.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.location.toLowerCase().includes(search.toLowerCase())
    );

    // Derive delivery address from logged-in user's default (or first) address
    const deliveryAddress = (() => {
        if (!user?.addresses || user.addresses.length === 0) return null;
        const def = user.addresses.find(a => a.isDefault) ?? user.addresses[0];
        return def?.address ?? null;
    })();

    return (
        <div className="min-h-screen bg-[#f8f8f8] font-sans antialiased">
            {/* ── STICKY NAVBAR ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
                    {/* Logo */}
                    <Link to="/" className="shrink-0 flex items-center gap-1">
                        <span className="text-2xl font-black tracking-tighter text-slate-900">
                            GRO<span className="text-[#0f9d58]">FAST</span>
                        </span>
                    </Link>

                    {/* Location pill */}
                    <Link
                        to={isAuthenticated ? "/profile" : "/auth/customer"}
                        className="hidden md:flex items-center gap-1.5 shrink-0 cursor-pointer group"
                    >
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Delivery in</span>
                            <span className="text-[13px] font-black text-slate-800 flex items-center gap-1">
                                10 minutes <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                            </span>
                        </div>
                        <div className="ml-1 flex items-center gap-1 text-[11px] text-slate-500 font-semibold border-l pl-3">
                            <MapPin className="w-3.5 h-3.5 text-[#0f9d58]" />
                            <span className="max-w-[160px] truncate">
                                {deliveryAddress
                                    ? deliveryAddress
                                    : isAuthenticated
                                        ? "Add your address →"
                                        : "Set your location"}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                    </Link>

                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            id="location-search"
                            name="location-search"
                            aria-label="Search shops"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search "shops"'
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/30 focus:border-[#0f9d58]/50 transition-all"
                        />
                    </div>

                    {/* Right buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={user?.role === "vendor" ? "/vendor" : user?.role === "admin" ? "/admin" : user?.role === "delivery" ? "/delivery" : "/profile"}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#0f9d58] flex items-center justify-center text-white text-xs font-bold">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{user?.name}</span>
                                </Link>
                                <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth/vendor">
                                    <button className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                        <Store className="w-4 h-4 text-[#0f9d58]" />
                                        Partner with us
                                    </button>
                                </Link>
                                <Link to="/auth/customer">
                                    <button className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                        Login
                                    </button>
                                </Link>
                            </>
                        )}

                        {/* Cart button */}
                        <button
                            onClick={() => cart.setIsOpen(true)}
                            className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                        >
                            <ShoppingCart className="w-4 h-4 text-slate-700" />
                            <span className="text-sm font-bold text-slate-700 hidden sm:inline">My Cart</span>
                            {cart.totalItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0f9d58] text-white text-[10px] font-bold flex items-center justify-center">
                                    {cart.totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

                {/* 1. HERO BANNER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1a5c3a 0%, #0f9d58 50%, #9cbe3b 100%)" }}
                >
                    <div className="relative z-10 p-8 md:p-12 max-w-xl">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                            <Zap className="w-3 h-3 text-yellow-300" />
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Fastest Delivery</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mb-3 tracking-tight drop-shadow-md">
                            Stock up on<br />daily essentials
                        </h1>
                        <p className="text-white/85 text-sm md:text-base font-medium mb-6 leading-relaxed max-w-xs">
                            Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more
                        </p>
                        <a href="#nearby-shops">
                            <button className="px-6 py-3 bg-white text-[#0f9d58] font-bold text-sm rounded-xl hover:bg-green-50 transition-colors shadow-lg shadow-black/10">
                                Go to Shop
                            </button>
                        </a>
                    </div>

                    {/* Hero image collage */}
                    <div className="absolute top-0 right-0 bottom-0 w-1/2 hidden md:block overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1543168256-418811576931?w=700&h=400&fit=crop"
                            alt="Fresh groceries"
                            className="w-full h-full object-cover opacity-90 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f9d58]/80 via-transparent to-transparent" />
                    </div>

                    {/* Decorative dots */}
                    <div className="absolute top-6 right-6 w-24 h-24 rounded-full border-2 border-white/10 hidden md:block" />
                    <div className="absolute bottom-4 right-28 w-16 h-16 rounded-full border-2 border-white/10 hidden md:block" />
                </motion.div>

                {/* 2. PROMO MINI-BANNERS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PROMO_BANNERS.map((b, i) => (
                        <Link to={b.link} key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                                className="relative rounded-2xl overflow-hidden flex items-stretch min-h-[140px] cursor-pointer group"
                                style={{ background: b.bg }}
                            >
                                <div className="flex-1 p-5 z-10">
                                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 block">{b.tag}</span>
                                    <h3 className="text-base font-black text-white leading-tight whitespace-pre-line mb-1.5">{b.title}</h3>
                                    <p className="text-[11px] text-white/75 font-medium mb-3">{b.sub}</p>
                                    <button className="px-4 py-1.5 bg-black/25 hover:bg-black/35 transition-colors text-white text-[11px] font-bold rounded-lg border border-white/20">
                                        {b.cta}
                                    </button>
                                </div>
                                <div className="w-28 relative shrink-0">
                                    <img
                                        src={b.img}
                                        alt={b.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-500"
                                    />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>



                {/* 4. SHOPS SECTION */}
                <section id="nearby-shops">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Local Stores Near You</h2>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                                {filtered.length} verified local partners
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <p className="text-4xl mb-4">🔍</p>
                            <h3 className="font-black text-slate-700 text-lg">No stores found</h3>
                            <p className="text-slate-400 text-sm mt-1">We're expanding. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((shop, i) => (
                                <ShopCard key={shop.id} shop={shop} index={i} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="mt-20 bg-slate-900 text-slate-300">
                {/* Top bar */}
                <div className="border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0f9d58] flex items-center justify-center">
                                <span className="text-white font-black text-sm">G</span>
                            </div>
                            <div>
                                <p className="text-white font-black text-lg tracking-tighter">
                                    GRO<span className="text-[#0f9d58]">FAST</span>
                                </p>
                                <p className="text-[10px] text-slate-500 font-semibold -mt-0.5">Hyperlocal Delivery Network</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {["App Store", "Google Play"].map((store) => (
                                <button key={store} className="px-4 py-2 rounded-xl border border-slate-700 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                                    {store}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main links */}
                <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Shop</p>
                        {["Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages", "Baby Care", "Pet Supplies"].map((l) => (
                            <p key={l} className="text-sm text-slate-500 hover:text-white cursor-pointer mb-2 transition-colors">{l}</p>
                        ))}
                    </div>
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Company</p>
                        {["About Us", "Careers", "Press", "Blog", "Partner with Us"].map((l) => (
                            <p key={l} className="text-sm text-slate-500 hover:text-white cursor-pointer mb-2 transition-colors">{l}</p>
                        ))}
                    </div>
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Support</p>
                        {["Help Center", "Track Order", "Return Policy", "Contact Us", "FAQs"].map((l) => (
                            <p key={l} className="text-sm text-slate-500 hover:text-white cursor-pointer mb-2 transition-colors">{l}</p>
                        ))}
                    </div>
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Social</p>
                        {[
                            { label: "Instagram", emoji: "📸" },
                            { label: "Twitter / X", emoji: "🐦" },
                            { label: "Facebook", emoji: "📘" },
                            { label: "YouTube", emoji: "▶️" },
                        ].map(({ label, emoji }) => (
                            <p key={label} className="text-sm text-slate-500 hover:text-white cursor-pointer mb-2 transition-colors flex items-center gap-2">
                                <span>{emoji}</span>{label}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                        <p>© 2025 GROFAST Technologies Pvt. Ltd. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                                <span key={l} className="hover:text-slate-300 cursor-pointer transition-colors">{l}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <CartDrawer
                open={cart.isOpen}
                onOpenChange={cart.setIsOpen}
                items={cart.items}
                subtotal={cart.subtotal}
                onUpdateQuantity={cart.updateQuantity}
                onRemove={cart.removeItem}
            />

            <BottomNav cartCount={cart.totalItems} onCartClick={() => cart.setIsOpen(true)} />
        </div>
    );
};

/* ─────────── SHOP CARD ─────────── */
import { Shop } from "@/lib/data";

const ShopCard = ({ shop, index }: { shop: Shop; index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.45, type: "spring", damping: 18 }}
    >
        <Link to={`/shop/${shop.id}`} className="block group">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-[#0f9d58]/10 hover:-translate-y-1 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-slate-50">
                    <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Open/closed badge */}
                    <div className="absolute top-3 left-3">
                        <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${shop.isOpen
                                ? "bg-[#0f9d58] text-white"
                                : "bg-slate-700 text-white"
                                }`}
                        >
                            {shop.isOpen ? "Open" : "Closed"}
                        </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-md">
                        <Star className="w-3 h-3 fill-amber-950" />
                        {shop.rating}
                    </div>

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-black text-lg leading-tight tracking-tight line-clamp-1">{shop.name}</h3>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-[#0f9d58]" />
                            <span className="truncate max-w-[140px]">{shop.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#0f9d58] text-xs font-bold bg-[#0f9d58]/8 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            {shop.distance}
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{shop.category}</span>
                        <span className="text-[10px] text-[#0f9d58] font-bold">Shop Now →</span>
                    </div>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default LocationSelection;
