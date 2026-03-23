import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, X, CheckCircle2, Plus } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

interface VendorSelectionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorSelectionModal({ product, isOpen, onClose }: VendorSelectionModalProps) {
  const { shops, refreshShops, isLoading: isShopsLoading } = useShops();
  const { products, refreshProducts, isLoading: isProductsLoading } = useProducts();
  const cart = useCart();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Refresh data when modal opens to ensure we have the latest shop/product availability
  useEffect(() => {
    if (isOpen) {
      refreshShops(true);
      refreshProducts();
    }
  }, [isOpen, refreshShops, refreshProducts]);

  // Find all identical products (same name) that are approved
  const identicalProducts = products.filter(p => p.name.trim().toLowerCase() === product.name.trim().toLowerCase() && p.isApproved);
  
  // Find shops that sell this identical product and are open
  const shopsSellingProduct = shops.filter(shop => {
      const sellsProduct = identicalProducts.some(p => p.vendorId === shop.vendorId);
      return shop.isOpen && sellsProduct;
  });

  const handleAddToCart = () => {
    if (!selectedVendorId) return;
    
    const shop = shops.find(s => s.id === selectedVendorId);
    const specificProduct = identicalProducts.find(p => p.vendorId === shop?.vendorId);
    
    if (specificProduct) {
      cart.addItem({
        ...specificProduct,
        shopName: shop?.name,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-0 md:inset-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 left-0 w-full md:w-[640px] lg:w-[720px] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl z-[60] overflow-hidden flex flex-col max-h-[85vh] md:max-h-[75vh] md:max-w-[calc(100vw-3rem)] border border-white/20 mx-auto md:mx-0"
          >
            {(isShopsLoading || isProductsLoading) ? (
              <>
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-white relative">
                  <div className="flex gap-5 w-full">
                    <Skeleton className="w-20 h-20 rounded-[1.5rem]" />
                    <div className="pt-2 flex-! flex-col gap-2 w-full max-w-[200px]">
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                </div>
                <div className="p-8 flex-1 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-3 w-40" />
                    <div className="h-px flex-1 bg-slate-100 ml-4"></div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-5 rounded-2xl border border-slate-100 flex items-center gap-5">
                        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <Skeleton className="w-full h-16 rounded-[1.5rem]" />
                </div>
              </>
            ) : (
              <>
                <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-white relative">
              <div className="flex gap-5">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-lg shadow-emerald-500/10 border border-slate-100 bg-slate-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#0f9d58] bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{product.category}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-white">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-black text-slate-400 tracking-[0.15em] uppercase">Nearby stores with stock</h4>
                <div className="h-px flex-1 bg-slate-100 ml-4"></div>
              </div>
              
              <div className="space-y-4">
                {shopsSellingProduct.length > 0 ? shopsSellingProduct.map(shop => {
                  const shopProduct = identicalProducts.find(p => p.vendorId === shop.vendorId);
                  const isSelected = selectedVendorId === shop.id;
                  
                  return (
                    <motion.div 
                      key={shop.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (shopsSellingProduct.indexOf(shop) * 0.05) }}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedVendorId(shop.id)}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 items-center group
                        ${isSelected ? 'border-[#0f9d58] bg-emerald-50/50 ring-1 ring-[#0f9d58]/20' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100 shadow-sm">
                        <img src={shop.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {!shop.isOpen && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Closed</span>
                            </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-slate-800 truncate text-base tracking-tight">{shop.name}</h5>
                          <div className="bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-sm font-bold text-[#0f9d58]">₹{shopProduct?.price}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-300" /> {shop.distance}</span>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="flex items-center gap-1.5 text-amber-600"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {shop.rating}</span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300
                        ${isSelected ? 'border-[#0f9d58] bg-[#0f9d58] scale-110' : 'border-slate-200 bg-slate-50'}`}>
                        {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
                        )}
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <MapPin className="w-8 h-8 text-slate-200" />
                    </div>
                    <h5 className="font-bold text-slate-700 mb-1">Out of Stock Nearby</h5>
                    <p className="text-xs text-slate-400 font-medium">Try checking back later or choosing a different item.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedVendorId}
                className="w-full h-16 rounded-[1.5rem] bg-[#0f9d58] hover:bg-[#0b8043] font-black text-white text-lg shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
              >
                Confirm Store & Add to Cart
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </>
  )}
    </AnimatePresence>
  );
}
