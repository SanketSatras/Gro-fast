import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shop } from '@/lib/data';
import { useShops } from '@/hooks/useShops';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ChevronRight, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturedShopsStack() {
    const { shops } = useShops();

    const featuredShops = useMemo(() => {
        return [...shops]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);
    }, [shops]);

    if (featuredShops.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="text-center mb-16 relative z-10">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                    ✨ Featured Partners
                </Badge>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                    Neighborhood <br className="hidden md:block" /> <span className="text-emerald-600 italic">Favorites</span>
                </h2>
                <p className="text-slate-500 font-bold max-w-lg mx-auto uppercase tracking-widest text-[10px]">
                    The highest rated stores in your neighborhood this week
                </p>
            </div>

            {/* Subtle radial background pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

            <div className="relative h-[450px] w-full max-w-[500px] flex items-center justify-center">
                {featuredShops.map((shop, index) => {
                    const isSingle = featuredShops.length === 1;
                    const rotation = isSingle ? 0 : (index === 0 ? -12 : index === 1 ? 12 : -2);
                    const offset = isSingle ? 0 : (index === 0 ? -100 : index === 1 ? 100 : 0);
                    const yOffset = index === 0 ? 30 : index === 1 ? -30 : 0;

                    const zIndex = 30 - index;
                    const scale = 1 - (index * 0.03);

                    return (
                        <Link
                            key={shop.id}
                            to={`/shop/${shop.id}`}
                            className="absolute block"
                            style={{ zIndex }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, x: offset }}
                                animate={{
                                    opacity: 1,
                                    scale: scale,
                                    x: offset,
                                    y: yOffset,
                                    rotate: rotation
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    rotate: 0,
                                    zIndex: 100,
                                    y: -20,
                                    transition: { type: 'spring', stiffness: 300 }
                                }}
                                className="w-[280px] md:w-[320px] bg-white rounded-[3.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.12)] border border-white overflow-hidden cursor-pointer group"
                            >
                                <div className="relative h-48 overflow-hidden bg-slate-50">
                                    <img
                                        src={shop.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
                                        alt={shop.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <div className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1 font-black text-[10px]">
                                            <Star className="w-3 h-3 fill-amber-950" />
                                            {shop.rating}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">{shop.category}</p>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase">{shop.distance}</Badge>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 group-hover:text-emerald-600 transition-colors line-clamp-1">{shop.name}</h3>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-[10px] font-bold truncate max-w-[120px]">{shop.location}</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
