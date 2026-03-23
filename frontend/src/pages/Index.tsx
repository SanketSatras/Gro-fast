import { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CategoryGrid, CategoryGridSkeleton } from "@/components/marketplace/CategoryGrid";
import { ProductListHorizontal, ProductListHorizontalSkeleton } from "@/components/marketplace/ProductListHorizontal";
import { ShopHeader, ShopHeaderSkeleton } from "@/components/marketplace/ShopHeader";
import { ShopInfoCard } from "@/components/marketplace/ShopInfoCard";
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { useShops } from '@/hooks/useShops';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { ShoppingCart, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Navbar } from '@/components/marketplace/Navbar';

const Index = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const cart = useCart();
  const { shops, isLoading } = useShops();
  const { products, isLoading: isProductsLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedShop = useMemo(() => shops.find(s => s.id === shopId), [shopId, shops]);

  // Show approved products for the vendor of this shop
  const shopProducts = useMemo(() => {
    if (!selectedShop) return [];
    return products.filter(
      p => p.vendorId === selectedShop.vendorId && p.isApproved
    );
  }, [products, selectedShop]);

  // Derive unique categories from this shop's products
  const shopCategories = useMemo(() => {
    const cats = new Set<string>();
    shopProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [shopProducts]);

  if (isLoading || isProductsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar 
          cartCount={cart.totalItems} 
          onCartClick={() => cart.setIsOpen(true)} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
        />
        <ShopHeaderSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-30 mb-8">
            <div className="h-24 bg-white rounded-3xl shadow-lg animate-pulse" />
        </div>
        <CategoryGridSkeleton />
        <ProductListHorizontalSkeleton />
      </div>
    );
  }

  if (!shopId || !selectedShop) {
    return <Navigate to="/" replace />;
  }

  // Category emoji map
  const categoryEmoji: Record<string, string> = {
    'groceries': '🥬', 'grocery': '🥬',
    'dairy': '🥛', 'bakery': '🍞',
    'snacks': '🍿', 'fruits': '🍎',
    'beverages': '🥤', 'meat': '🥩',
    'vegetables': '🥕', 'frozen': '🧊',
  };

  // Filter products by selected category and search query
  const filteredProducts = shopProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans antialiased pb-28">
      <Navbar 
        cartCount={cart.totalItems} 
        onCartClick={() => cart.setIsOpen(true)} 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />

      {/* Hero Header */}
      <ShopHeader shop={selectedShop} />

      {/* Floating Info Card */}
      <ShopInfoCard />

      {/* Body content with nice vertical rhythm */}
      <div className="mt-8 space-y-2">
        {/* Trust signals strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-3">
            {[
              { emoji: "✅", text: "FSSAI Certified" },
              { emoji: "🚚", text: "Fast Delivery" },
              { emoji: "💳", text: "Secure Payments" },
              { emoji: "🔄", text: "Easy Returns" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-100 text-xs font-semibold text-slate-600 shadow-sm">
                <span>{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Section */}
        {shopCategories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Shop by Category</h2>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Browse what's available</p>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-3 no-scrollbar">
              {/* All button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200
                  ${selectedCategory === 'all' 
                    ? 'bg-[#0f9d58] text-white border-[#0f9d58] shadow-lg shadow-[#0f9d58]/20' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
              >
                <span className="text-lg">🛒</span>
                <span>All</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {shopProducts.length}
                </span>
              </motion.button>

              {shopCategories.map(cat => {
                const count = shopProducts.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                const emoji = categoryEmoji[cat.toLowerCase()] || '📦';
                
                return (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200
                      ${isActive 
                        ? 'bg-[#0f9d58] text-white border-[#0f9d58] shadow-lg shadow-[#0f9d58]/20' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="capitalize">{cat}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <ProductListHorizontal products={filteredProducts} onAdd={cart.addItem} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="font-black text-slate-700 text-lg">No products found</h3>
                <p className="text-slate-400 text-sm mt-1">
                  {selectedCategory === 'all' 
                    ? "This store hasn't listed any products yet."
                    : `No products in the "${selectedCategory}" category. Try another category.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Cart Bar — only shows when items added */}
      <AnimatePresence>
        {cart.totalItems > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <button
              onClick={() => cart.setIsOpen(true)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#0f9d58] rounded-2xl text-white shadow-2xl shadow-[#0f9d58]/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{cart.totalItems} item{cart.totalItems !== 1 ? "s" : ""}</p>
                  <p className="text-sm font-black">View Cart</p>
                </div>
              </div>
              <span className="font-black text-base">₹{cart.subtotal}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
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

export default Index;
