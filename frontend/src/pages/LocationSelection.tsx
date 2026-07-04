import { useState } from "react";
import { Link } from "react-router-dom";
import { useShops } from "@/hooks/useShops";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/marketplace/CartDrawer";
import { LocationModal } from "@/components/marketplace/LocationModal";
import { BottomNav } from "@/components/marketplace/BottomNav";
import {
    ShoppingCart, Search, MapPin, ChevronDown,
    Star, Clock, LogOut, Store, Zap, ArrowRight,
    ShieldCheck, RefreshCw, Truck, Award, ChevronRight,
    Sparkles, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Shop } from "@/lib/data";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CATEGORIES = [
    { label: "Fruits & Veg",   emoji: "ðŸ¥¦", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { label: "Dairy & Bread",  emoji: "ðŸ¥›", color: "bg-blue-50   text-blue-700   border-blue-100"   },
    { label: "Snacks",         emoji: "ðŸŸ", color: "bg-amber-50  text-amber-700  border-amber-100"  },
    { label: "Bakery",         emoji: "ðŸ¥–", color: "bg-orange-50 text-orange-700 border-orange-100" },
    { label: "Beverages",      emoji: "ðŸ¥¤", color: "bg-purple-50 text-purple-700 border-purple-100" },
    { label: "Breakfast",      emoji: "ðŸ¥£", color: "bg-pink-50   text-pink-700   border-pink-100"   },
    { label: "Sweet Tooth",    emoji: "ðŸ«", color: "bg-rose-50   text-rose-700   border-rose-100"   },
    { label: "Tea & Coffee",   emoji: "â˜•", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    { label: "Masala",         emoji: "ðŸŒ¶ï¸", color: "bg-red-50    text-red-700    border-red-100"    },
    { label: "Cleaning",       emoji: "ðŸ§¹", color: "bg-cyan-50   text-cyan-700   border-cyan-100"   },
    { label: "Paan Corner",    emoji: "ðŸƒ", color: "bg-lime-50   text-lime-700   border-lime-100"   },
    { label: "Atta & Rice",    emoji: "ðŸŒ¾", color: "bg-stone-50  text-stone-700  border-stone-100"  },
];

const TRUST_BADGES = [
    { icon: ShieldCheck, text: "FSSAI Certified",    color: "text-emerald-500" },
    { icon: Truck,       text: "10-Min Delivery",    color: "text-blue-500"   },
    { icon: RefreshCw,   text: "Easy Returns",       color: "text-purple-500" },
    { icon: Award,       text: "Top-rated Vendors",  color: "text-amber-500"  },
];

const PROMO_BANNERS = [
    {
        gradient: "from-[#0f4c2a] to-[#0f9d58]",
        accent: "#4ade80",
        tag: "ðŸ›’ All Essentials",
        title: "All your needs\ndelivered fast!",
        sub: "Vegetables, fruits, pulses & daily essentials",
        cta: "Shop Now",
        link: "/category/all",
        img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=280&h=200&fit=crop",
    },
    {
        gradient: "from-[#0d3569] to-[#1976d2]",
        accent: "#60a5fa",
        tag: "ðŸ¥› Dairy",
        title: "Farm-fresh dairy\nat your door",
        sub: "Milk, paneer, butter, curd & more",
        cta: "Order Now",
        link: "/category/dairy",
        img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=280&h=200&fit=crop",
    },
    {
        gradient: "from-[#5c2d0a] to-[#c4813a]",
        accent: "#fbbf24",
        tag: "ðŸ¥– Bakery",
        title: "Freshly baked\nevery morning",
        sub: "Bread, muffins, cakes & pastries",
        cta: "Order Now",
        link: "/category/bakery",
        img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=280&h=200&fit=crop",
    },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ANIMATION VARIANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const LocationSelection = () => {
    const [search, setSearch] = useState("");
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [customLocation, setCustomLocation] = useState(localStorage.getItem("grofast-custom-location"));
    const { user, logout, isAuthenticated } = useAuth();
    const { shops, isLoading } = useShops();
    const cart = useCart();

    const sortedShops = [...shops].sort((a, b) => b.id.localeCompare(a.id));
    const filtered = sortedShops.filter(
        (s) => s.name.toLowerCase().includes(search.toLowerCase()) ||
               s.location.toLowerCase().includes(search.toLowerCase())
    );

    const deliveryAddress = (() => {
        if (customLocation) return customLocation;
        if (!user?.addresses || user.addresses.length === 0) return null;
        const def = user.addresses.find(a => a.isDefault) ?? user.addresses[0];
        return def?.address ?? null;
    })();
    const dashboardLink = user?.role === "vendor"   ? "/vendor"
                        : user?.role === "admin"    ? "/admin"
                        : user?.role === "delivery" ? "/delivery"
                        : "/profile";

    return (
        <div className="min-h-screen bg-[#F6F8FB] font-sans antialiased">

            {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ NAVBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
                    <Link to="/" className="shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#0f9d58] flex items-center justify-center shadow-md shadow-[#0f9d58]/30">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">
                            GRO<span className="text-[#0f9d58]">FAST</span>
                        </span>
                    </Link>
                    <div onClick={() => setIsLocationOpen(true)} className="cursor-pointer flex items-center gap-1.5 shrink-0 pl-3 border-l border-slate-100 group">
                        <MapPin className="w-3.5 h-3.5 text-[#0f9d58] shrink-0" />
                        <span className="text-xs font-semibold text-slate-500 max-w-[100px] sm:max-w-[130px] truncate">
                            {deliveryAddress ?? (isAuthenticated ? "Add address" : "Set location")}
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>




                    <div className="hidden sm:flex flex-1 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="location-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops or products..." autoComplete="off" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/25 focus:border-[#0f9d58]/40 transition-all" />
                    </div>
                    <div className="flex-1 sm:hidden" />
                    <div className="flex items-center gap-2 shrink-0">
                        {isAuthenticated ? (
                            <>
                                <Link to={dashboardLink} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0f9d58] to-[#0d8a4e] flex items-center justify-center text-white text-xs font-black shadow-sm">{user?.name?.charAt(0).toUpperCase()}</div>
                                    <span className="text-sm font-bold text-slate-700">{user?.name}</span>
                                </Link>
                                <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth/vendor"><button className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-[#0f9d58]/30 transition-all"><Store className="w-4 h-4 text-[#0f9d58]" />Partner with us</button></Link>
                                <Link to="/auth/customer"><button className="hidden sm:block px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Login</button></Link>
                            </>
                        )}
                        <button onClick={() => cart.setIsOpen(true)} className="relative flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl bg-[#0f9d58] text-white hover:bg-[#0d8a4e] transition-colors shadow-md shadow-[#0f9d58]/20">
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-sm font-bold hidden sm:inline">My Cart</span>
                            {cart.totalItems > 0 && (<span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[#0f9d58] text-[10px] font-black flex items-center justify-center shadow-sm">{cart.totalItems}</span>)}
                        </button>
                    </div>
                </div>
                <div className="sm:hidden px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input id="location-search-mobile" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shops or products..." autoComplete="off" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/25 focus:border-[#0f9d58]/40 transition-all" />
                    </div>
                </div>
            </header>

            {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MAIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 pb-32">

                {/* â”€â”€ 1. HERO BANNER â”€â”€ */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                    className="relative rounded-3xl overflow-hidden min-h-[280px] md:min-h-[320px] flex items-center"
                    style={{ background: "linear-gradient(130deg, #0c3d24 0%, #0f9d58 55%, #47c77b 100%)" }}
                >
                    {/* Decorative circles */}
                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-10 right-32 w-48 h-48 rounded-full bg-white/5" />
                    <div className="absolute top-8 right-10 w-20 h-20 rounded-full border border-white/10 hidden md:block" />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-14 max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 rounded-full mb-5"
                        >
                            <Zap className="w-3.5 h-3.5 text-yellow-300" />
                            <span className="text-white text-[11px] font-bold uppercase tracking-widest">Fastest Delivery · 10 min</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-4xl md:text-5xl font-black text-white leading-[1.08] mb-4 tracking-tight"
                        >
                            Stock up on<br />
                            <span className="text-yellow-300">daily essentials</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="text-white/80 text-sm md:text-base font-medium mb-7 leading-relaxed max-w-sm"
                        >
                            Get farm-fresh goodness, fruits, vegetables, dairy and more from local stores near you.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.42 }}
                            className="flex items-center gap-3"
                        >
                            <a href="#nearby-shops">
                                <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#0f9d58] font-black text-sm rounded-xl hover:bg-green-50 transition-colors shadow-xl shadow-black/10">
                                    Shop Now <ArrowRight className="w-4 h-4" />
                                </button>
                            </a>
                            <a href="#categories">
                                <button className="px-6 py-3 border border-white/25 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-colors">
                                    Browse Categories
                                </button>
                            </a>
                        </motion.div>
                    </div>

                    {/* Hero image */}
                    <div className="absolute top-0 right-0 bottom-0 w-[45%] hidden md:block overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1543168256-418811576931?w=700&h=400&fit=crop"
                            alt="Fresh groceries"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f9d58] via-[#0f9d58]/30 to-transparent" />
                    </div>

                    {/* Floating stats chip */}
                    <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3">
                        <div className="text-center">
                            <p className="text-white font-black text-lg leading-none">{shops.length}+</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase">Stores</p>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <p className="text-white font-black text-lg leading-none">10m</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase">Delivery</p>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <p className="text-white font-black text-lg leading-none">4.8â˜…</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase">Rating</p>
                        </div>
                    </div>
                </motion.div>

                {/* â”€â”€ 2. TRUST BADGES â”€â”€ */}
                <motion.div
                    variants={stagger} initial="hidden" animate="show"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                    {TRUST_BADGES.map(({ icon: Icon, text, color }) => (
                        <motion.div
                            key={text}
                            variants={fadeUp}
                            className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                            <span className="text-sm font-bold text-slate-700">{text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* â”€â”€ 3. CATEGORIES â”€â”€ */}
                <section id="categories">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#0f9d58]" />
                                Shop by Category
                            </h2>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Browse what's available today</p>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                        {CATEGORIES.map(({ label, emoji, color }, i) => (
                            <motion.div
                                key={label}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold cursor-pointer select-none transition-shadow hover:shadow-md ${color}`}
                            >
                                <span className="text-base">{emoji}</span>
                                {label}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* â”€â”€ 4. PROMO BANNERS â”€â”€ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PROMO_BANNERS.map((b, i) => (
                        <Link to={b.link} key={i}>
                            <motion.div
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                whileHover={{ y: -4, scale: 1.01 }}
                                className={`relative rounded-2xl overflow-hidden flex items-stretch min-h-[160px] cursor-pointer group bg-gradient-to-br ${b.gradient}`}
                            >
                                {/* Text */}
                                <div className="flex-1 p-5 z-10 relative">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1.5 block">{b.tag}</span>
                                    <h3 className="text-base font-black text-white leading-tight whitespace-pre-line mb-2">{b.title}</h3>
                                    <p className="text-[11px] text-white/65 font-medium mb-4 leading-relaxed">{b.sub}</p>
                                    <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 border border-white/25 text-white text-[11px] font-bold rounded-lg transition-colors">
                                        {b.cta} <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                {/* Image */}
                                <div className="w-28 relative shrink-0">
                                    <img
                                        src={b.img}
                                        alt={b.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                                    />
                                </div>
                                {/* Bottom accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: b.accent }} />
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* â”€â”€ 5. SHOPS SECTION â”€â”€ */}
                <section id="nearby-shops">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#0f9d58]" />
                                Local Stores Near You
                            </h2>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                                {filtered.length} verified local partners
                            </p>
                        </div>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="text-xs font-bold text-[#0f9d58] hover:underline"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-5xl mb-4">ðŸ”</p>
                            <h3 className="font-black text-slate-800 text-lg">No stores found</h3>
                            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                                We couldn't find "{search}". Try a different name or location.
                            </p>
                            <button onClick={() => setSearch("")} className="mt-4 text-sm font-bold text-[#0f9d58] hover:underline">
                                Show all stores
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            variants={stagger} initial="hidden" animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {filtered.map((shop, i) => (
                                <ShopCard key={shop.id} shop={shop} index={i} />
                            ))}
                        </motion.div>
                    )}
                </section>
            </main>

            {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <footer className="bg-slate-950 text-slate-400">
                {/* Top brand strip */}
                <div className="border-b border-slate-800/70">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0f9d58] flex items-center justify-center shadow-md">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-black text-xl tracking-tighter leading-none">
                                    GRO<span className="text-[#0f9d58]">FAST</span>
                                </p>
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Hyperlocal Delivery Network</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {["App Store", "Google Play"].map((s) => (
                                <button key={s} className="px-4 py-2 rounded-xl border border-slate-700 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Link columns */}
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Shop</p>
                        <ul className="space-y-2.5">
                            {[
                                { label: "Fruits & Vegetables", to: "/category/vegetables" },
                                { label: "Dairy & Eggs",        to: "/category/dairy"      },
                                { label: "Snacks",              to: "/category/snacks"     },
                                { label: "Beverages",           to: "/category/beverages"  },
                                { label: "Baby Care",           to: "/category/baby-care"  },
                            ].map(({ label, to }) => (
                                <li key={label} className="list-none">
                                    <Link to={to} className="text-sm text-slate-500 hover:text-white transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Company</p>
                        <ul className="space-y-2.5">
                            {[
                                { label: "About Us",        href: "#"            },
                                { label: "Careers",         href: "#"            },
                                { label: "Press",           href: "#"            },
                                { label: "Blog",            href: "#"            },
                                { label: "Partner with Us", href: "/auth/vendor" },
                            ].map(({ label, href }) => (
                                <li key={label} className="list-none">
                                    <a href={href} className="text-sm text-slate-500 hover:text-white transition-colors">{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Support</p>
                        <ul className="space-y-2.5">
                            {[
                                { label: "Help Center",   href: "#"                        },
                                { label: "Track Order",   href: "/order-tracking/demo"      },
                                { label: "Return Policy", href: "#"                        },
                                { label: "Contact Us",    href: "mailto:support@grofast.in" },
                                { label: "FAQs",          href: "#"                        },
                            ].map(({ label, href }) => (
                                <li key={label} className="list-none">
                                    <a href={href} className="text-sm text-slate-500 hover:text-white transition-colors">{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-white font-black text-sm mb-4 uppercase tracking-wider">Legal</p>
                        <ul className="space-y-2.5">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"].map((l) => (
                                <li key={l} className="list-none">
                                    <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">{l}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-800/70">
                    <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                        <p>Â© 2025 GROFAST Technologies Pvt. Ltd. All rights reserved.</p>
                        <div className="flex items-center gap-1 text-[#0f9d58]/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0f9d58] animate-pulse" />
                            <span className="text-xs font-bold text-[#0f9d58]/70">All systems operational</span>
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

            <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} onSelectLocation={(loc) => { setCustomLocation(loc); localStorage.setItem("grofast-custom-location", loc); }} />
            <BottomNav cartCount={cart.totalItems} onCartClick={() => cart.setIsOpen(true)} />
        </div>
    );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ SHOP CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ShopCard = ({ shop, index }: { shop: Shop; index: number }) => (
    <motion.div
        variants={fadeUp}
        custom={index}
        whileHover={{ y: -4 }}
        className="group"
    >
        <Link to={`/shop/${shop.id}`} className="block">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#0f9d58]/8 transition-all duration-300">

                {/* Thumbnail */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                    {/* Open/Closed */}
                    <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            shop.isOpen
                                ? "bg-[#0f9d58] text-white shadow-md shadow-[#0f9d58]/30"
                                : "bg-slate-800/80 backdrop-blur-sm text-slate-300"
                        }`}>
                            {shop.isOpen ? "â— Open" : "â—‹ Closed"}
                        </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-black shadow-md">
                        <Star className="w-3 h-3 fill-amber-950" />
                        {shop.rating}
                    </div>

                    {/* Shop name overlay */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-white font-black text-lg leading-tight tracking-tight line-clamp-1">{shop.name}</h3>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-[#0f9d58] shrink-0" />
                            <span className="truncate max-w-[140px]">{shop.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#0f9d58] text-xs font-bold bg-[#0f9d58]/8 px-2.5 py-1 rounded-full border border-[#0f9d58]/10">
                            <Clock className="w-3 h-3" />
                            {shop.distance}
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {shop.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#0f9d58] font-black group-hover:gap-2 transition-all">
                            Shop Now <ArrowRight className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default LocationSelection;
