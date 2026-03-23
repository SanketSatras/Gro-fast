import { ChevronLeft, Heart, Star, Clock, Truck, ShoppingBag, Search, Share2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Shop } from "@/lib/data";
import { motion } from "framer-motion";
import { useState } from "react";

interface ShopHeaderProps {
    shop: Shop;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
    const [liked, setLiked] = useState(false);

    return (
        <div className="relative w-full overflow-hidden bg-slate-900" style={{ height: "300px" }}>
            {/* Full bleed hero image */}
            <motion.img
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={shop.image}
                alt={shop.name}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Multi-layer gradient darken */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            {/* Top action bar */}
            <div className="absolute top-0 inset-x-0 px-6 pt-6 flex justify-between items-center z-20">
                <Link
                    to="/"
                    className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-all"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                    <span className="text-white text-sm font-bold hidden sm:inline">Back</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-all">
                        <Share2 className="w-4.5 h-4.5 text-white" />
                    </button>
                    <button
                        onClick={() => setLiked(l => !l)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-all"
                    >
                        <Heart
                            className={`w-4.5 h-4.5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
                        />
                    </button>
                </div>
            </div>

            {/* Bottom info overlay */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute bottom-0 inset-x-0 px-6 pb-8 z-20"
            >
                {/* Category badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f9d58]/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                    🛒 {shop.category}
                </span>

                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                    {shop.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(shop.rating) ? "fill-amber-400 text-amber-400" : "fill-white/20 text-white/20"}`} />
                            ))}
                        </div>
                        <span className="text-white font-bold text-sm">{shop.rating}</span>
                        <span className="text-white/60 text-xs font-medium">(40+ reviews)</span>
                    </div>

                    <div className="flex items-center gap-1 text-white/80 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#0f9d58]" />
                        {shop.location}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${shop.isOpen ? "bg-[#0f9d58]/70 text-white" : "bg-red-500/70 text-white"}`}>
                        {shop.isOpen ? "● Now Open" : "● Closed"}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
export function ShopHeaderSkeleton() {
    return (
        <div className="relative w-full overflow-hidden bg-slate-100 animate-pulse" style={{ height: "300px" }}>
            <div className="absolute bottom-0 inset-x-0 px-6 pb-8 z-20 space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                <div className="flex gap-4">
                    <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-40 bg-slate-200 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
