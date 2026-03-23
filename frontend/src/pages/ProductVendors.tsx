import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowLeft, ShoppingBag, CheckCircle2, Search } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Navbar } from '@/components/marketplace/Navbar';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { Button } from '@/components/ui/button';

export default function ProductVendors() {
  const { productName } = useParams<{ productName: string }>();
  const navigate = useNavigate();
  const { shops, isLoading: shopsLoading, refreshShops } = useShops();
  const { products, refreshProducts } = useProducts();
  const cart = useCart();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    refreshShops(true);
    refreshProducts();
  }, [refreshShops, refreshProducts]);

  const decodedProductName = decodeURIComponent(productName || '');
  
  // Find all identical products (same name) that are approved
  const identicalProducts = products.filter(p => 
    p.name.trim().toLowerCase() === decodedProductName.trim().toLowerCase() && p.isApproved
  );
  
  // Find the representative product for UI details
  const representativeProduct = identicalProducts[0];

  // Find shops that sell this identical product and are open
  const shopsSellingProduct = shops.filter(shop => {
      const sellsProduct = identicalProducts.some(p => p.vendorId === shop.vendorId);
      const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase());
      return shop.isOpen && sellsProduct && matchesSearch;
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
      cart.setIsOpen(true);
    }
  };

  if (shopsLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <Navbar 
          cartCount={cart.totalItems} 
          onCartClick={() => cart.setIsOpen(true)} 
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-10 w-48 bg-slate-200 rounded-xl mb-8" />
          <div className="h-64 bg-white rounded-3xl mb-8" />
          <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!representativeProduct) {
    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Product Not Found</h1>
            <p className="text-slate-500 mb-8">We couldn't find any stores selling this product.</p>
            <Button onClick={() => navigate(-1)} className="bg-[#0f9d58] hover:bg-[#0b8043]">
                Go Back
            </Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">
      <Navbar 
        cartCount={cart.totalItems} 
        onCartClick={() => cart.setIsOpen(true)} 
        searchQuery={search}
        onSearchChange={setSearch}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm mb-8 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to category
        </button>

        {/* Product Details Header */}
        <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-48 aspect-square rounded-3xl overflow-hidden shadow-lg border border-slate-50 bg-slate-50">
              <img src={representativeProduct.image} alt={representativeProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black text-[#0f9d58] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100/50">
                    {representativeProduct.category}
                </span>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100/50">
                    {representativeProduct.unit || '1 unit'}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-800 leading-tight mb-4">{representativeProduct.name}</h1>
              <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                Choose your preferred store below. Prices and delivery times may vary based on your location and the vendor's current stock levels.
              </p>
            </div>
          </div>
        </section>

        {/* Store List */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Available Nearby</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
                Showing <span className="text-[#0f9d58]">{shopsSellingProduct.length}</span> verified vendors
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {shopsSellingProduct.length > 0 ? (
              shopsSellingProduct.map((shop, index) => {
                const shopProduct = identicalProducts.find(p => p.vendorId === shop.vendorId);
                const isSelected = selectedVendorId === shop.id;
                
                return (
                  <motion.div 
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedVendorId(shop.id)}
                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col sm:flex-row gap-6 items-center group
                      ${isSelected ? 'border-[#0f9d58] bg-emerald-50/30' : 'border-white bg-white hover:border-slate-200 hover:shadow-xl shadow-sm'}`}
                  >
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100 shadow-sm">
                      <img src={shop.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-800 truncate tracking-tight">{shop.name}</h3>
                        <div className="inline-flex items-center justify-center bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                          <span className="text-lg font-black text-[#0f9d58]">₹{shopProduct?.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#0f9d58]" /> {shop.distance}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:block" />
                        <span className="flex items-center gap-1.5 text-amber-600"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {shop.rating} Rating</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden sm:block" />
                        <span className="text-emerald-600">In Stock</span>
                      </div>
                    </div>

                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-300
                      ${isSelected ? 'border-[#0f9d58] bg-[#0f9d58] shadow-lg shadow-emerald-500/20' : 'border-slate-100 bg-slate-50 group-hover:border-slate-200'}`}>
                      {isSelected ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                          <div className="w-3 h-3 rounded-full bg-slate-200 group-hover:bg-[#0f9d58]/30 transition-colors" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No vendors found</h3>
                <p className="text-sm text-slate-400 font-medium">Try adjusting your search or location settings.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Selection Bar */}
      {selectedVendorId && (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 p-6 z-40"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-900 rounded-[2rem] p-4 shadow-2xl shadow-slate-900/40 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="hidden sm:block pl-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Selected Store</p>
                        <p className="text-white font-bold tracking-tight truncate max-w-[200px]">
                            {shops.find(s => s.id === selectedVendorId)?.name}
                        </p>
                    </div>
                    <Button 
                        onClick={handleAddToCart}
                        className="flex-1 h-14 rounded-2xl bg-[#0f9d58] hover:bg-[#0b8043] font-black text-white text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all duration-300 gap-3"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Add to Cart & View
                    </Button>
                </div>
            </div>
        </motion.div>
      )}

      <CartDrawer 
        open={cart.isOpen} 
        onOpenChange={cart.setIsOpen}
        items={cart.items}
        subtotal={cart.subtotal}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
      />
    </div>
  );
}
