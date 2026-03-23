import { motion } from 'framer-motion';
import { Plus, Store, MapPin } from 'lucide-react';
import { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  index: number;
}

export function ProductCard({ product, onAdd, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card overflow-hidden group border border-slate-200/60 hover:border-emerald-500/20 hover:shadow-lg transition-transform duration-300 h-full flex flex-col bg-white cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.currentTarget.click();
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop&q=40'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop&q=40';
          }}
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badges?.includes('fresh') && (
            <span className="bg-white/95 backdrop-blur-md text-[#0f9d58] text-[9px] font-bold px-2 py-1.5 rounded-full shadow-sm border border-emerald-50 uppercase tracking-widest leading-none">🌿 Fresh</span>
          )}
          {product.badges?.includes('local') && (
            <span className="bg-white/95 backdrop-blur-md text-amber-600 text-[9px] font-bold px-2 py-1.5 rounded-full shadow-sm border border-amber-50 uppercase tracking-widest leading-none">📍 Local</span>
          )}
        </div>
        {product.stock <= 5 && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-sm">
            {product.stock} LEFT
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-slate-800 text-base md:text-lg leading-snug group-hover:text-[#0f9d58] transition-colors line-clamp-2 min-h-[2.4rem]">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Store className="w-3 h-3 text-[#0f9d58]" />
              <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[100px]">{product.shopName || 'GROFAST Partner'}</span>
            </div>
            <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
            <span className="text-[10px] font-semibold text-slate-400 capitalize">{product.unit || 'per unit'}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">₹{product.price}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
            }}
            className="w-10 h-10 rounded-full bg-[#0f9d58] text-white flex items-center justify-center shadow-lg shadow-emerald-500/10 hover:bg-[#0b8043] transition-all"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-12 bg-muted rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-12 bg-muted rounded" />
          <div className="w-9 h-9 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}
