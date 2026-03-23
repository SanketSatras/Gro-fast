import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { ShoppingBasket } from 'lucide-react';

interface TopRatedStackProps {
    shopId: string;
}

export function TopRatedStack({ shopId }: TopRatedStackProps) {
    const { products } = useProducts();

    const topRated = useMemo(() => {
        return products
            .filter(p => p.vendorId === shopId && p.isApproved)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3);
    }, [products, shopId]);

    if (topRated.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Subtle radial background pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

            <div className="relative h-[350px] w-full max-w-[400px] flex items-center justify-center">
                {topRated.map((product, index) => {
                    const isSingle = topRated.length === 1;
                    // Precise fan-out rotations from the reference image
                    const rotation = isSingle ? 0 : (index === 0 ? -12 : index === 1 ? 8 : -2);
                    const offset = isSingle ? 0 : (index === 0 ? -80 : index === 1 ? 60 : 0);
                    const yOffset = index === 0 ? 20 : index === 1 ? -20 : 0;

                    const zIndex = 30 - index;
                    const scale = 1 - (index * 0.02);

                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.8, x: offset }}
                            animate={{
                                opacity: 1,
                                scale: scale,
                                x: offset,
                                y: yOffset,
                                rotate: rotation
                            }}
                            whileHover={{
                                scale: 1.08,
                                rotate: 0,
                                zIndex: 100,
                                y: -20,
                                transition: { type: 'spring', stiffness: 300 }
                            }}
                            className="absolute w-[240px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden cursor-pointer group"
                            style={{ zIndex }}
                        >
                            <div className="relative aspect-square overflow-hidden bg-slate-50">
                                <img
                                    src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 bg-white">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Fresh Choice</p>
                                <h3 className="text-lg font-black text-slate-900 truncate mb-4">{product.name}</h3>

                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-black text-slate-900">₹{product.price}</span>
                                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                        <span className="text-[10px]">🌿</span>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Fresh</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
