import { Star, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Shop } from "@/lib/data";
import { motion } from "framer-motion";

interface StoreCardSquareProps {
    store: Shop;
}

export function StoreCardSquare({ store }: StoreCardSquareProps) {
    return (
        <motion.div
            whileHover={{ y: -6 }}
            className="shrink-0"
        >
            <Link to={`/shop/${store.id}`} className="block w-[220px] md:w-[240px]">
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
                    <div className="relative h-36 overflow-hidden bg-slate-100">
                        <img
                            src={store.image}
                            alt={store.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                        <div className="absolute bottom-4 left-4 text-white">
                            <p className="font-black text-xl leading-tight uppercase tracking-tighter">15% OFF</p>
                            <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">FRESH DEALS</p>
                        </div>

                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="p-5">
                        <h3 className="font-black text-slate-800 text-base mb-2 truncate group-hover:text-[#0f9d58] transition-colors">{store.name}</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span className="text-xs font-black text-amber-600">{store.rating}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{store.distance}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
