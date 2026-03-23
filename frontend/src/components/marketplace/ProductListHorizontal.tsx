import { Plus, Star } from "lucide-react";
import { Product } from "@/lib/data";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductListHorizontalProps {
    products: Product[];
    onAdd: (product: Product) => void;
}

export function ProductListHorizontal({ products, onAdd }: ProductListHorizontalProps) {
    return (
        <div className="mt-8 mb-4 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Recommended Products</h2>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Handpicked for you</p>
                </div>
                <button className="text-[11px] font-bold text-[#0f9d58] border border-[#0f9d58]/20 px-3 py-1.5 rounded-full hover:bg-[#0f9d58]/5 transition-colors">
                    View all
                </button>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                {products.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        className="snap-start shrink-0 w-[170px] bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-xl hover:shadow-[#0f9d58]/8 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                    >
                        {/* Image area */}
                        <div className="relative h-36 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain drop-shadow-md hover:scale-110 transition-transform duration-500"
                            />
                            {/* Discount badge */}
                            <div className="absolute top-2.5 left-2.5 bg-[#0f9d58] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                                10% OFF
                            </div>
                            {/* Fresh badge if applicable */}
                            {product.badges?.includes("fresh") && (
                                <div className="absolute top-2.5 right-2.5 bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                                    🌿 Fresh
                                </div>
                            )}
                        </div>

                        {/* Product info */}
                        <div className="p-3.5 flex flex-col flex-1 bg-white">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{product.category}</p>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2 flex-1">{product.name}</h3>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-3">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-[11px] font-bold text-slate-500">{product.rating}</span>
                                <span className="text-[10px] text-slate-400 font-medium">· {product.unit}</span>
                            </div>

                            {/* Price + add */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-slate-800">₹{product.price}</span>
                                    <span className="text-[10px] text-slate-400 line-through">₹{Math.round(product.price * 1.12)}</span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onAdd(product)}
                                    className="w-9 h-9 rounded-2xl bg-[#0f9d58] flex items-center justify-center shadow-lg shadow-[#0f9d58]/30 hover:bg-[#0c8c4e] transition-colors"
                                >
                                    <Plus className="w-4.5 h-4.5 text-white" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export function ProductListHorizontalSkeleton() {
    return (
        <div className="mt-8 mb-4 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Recommended Products</h2>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Handpicked for you</p>
                </div>
                <div className="w-16 h-7 rounded-full bg-slate-100 animate-pulse" />
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="shrink-0 w-[170px] bg-white rounded-[22px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
                        <Skeleton className="h-36 w-full rounded-none" />
                        <div className="p-3.5 flex flex-col flex-1">
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-3/4 mb-4" />
                            <div className="flex items-center justify-between mt-auto">
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-12" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-9 w-9 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
