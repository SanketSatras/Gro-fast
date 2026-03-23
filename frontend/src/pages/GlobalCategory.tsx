import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ShoppingBag, Plus } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { categories } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/marketplace/Navbar';
import { ProductCardSkeleton } from '@/components/marketplace/ProductCard';

export default function GlobalCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { shops, isLoading: shopsLoading } = useShops();
  const { products } = useProducts();
  const cart = useCart();
  
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Unify products from all shops
  const globalProducts = useMemo(() => {
    if (!shops || !products) return [];
    
    // Map to keep track of uniquely named products in this category
    const productMap = new Map();
    
    // Only consider products from open shops
    const availableProducts = products.filter(p => {
        // Link product to shop via their shared vendorId
        const shop = shops.find(s => s.vendorId === p.vendorId);
        return shop && p.isApproved;
    });

    availableProducts.forEach(product => {
      // Filter by route category if not 'all'
      if (categoryId && categoryId !== 'all') {
        const pCat = product.category.toLowerCase();
        const routeCat = categoryId.toLowerCase();
        
        // Handle plural/singular mismatches like "grocery" vs "groceries"
        const isMatch = pCat === routeCat || 
                        (pCat === 'groceries' && routeCat === 'grocery') ||
                        (pCat === 'grocery' && routeCat === 'groceries') ||
                        pCat.includes(routeCat) || 
                        routeCat.includes(pCat);
                        
        if (!isMatch) return;
      }

      const normalizedName = product.name.trim().toLowerCase();
      
      if (!productMap.has(normalizedName)) {
        // Store the first instance as the "Global Product" representation
        productMap.set(normalizedName, {
          ...product,
          availableInShops: 1,
          startingPrice: product.price
        });
      } else {
        // Update stats
        const existing = productMap.get(normalizedName);
        existing.availableInShops += 1;
        existing.startingPrice = Math.min(existing.startingPrice, product.price);
      }
    });
    
    return Array.from(productMap.values());
  }, [shops, products, categoryId]);

  const filteredProducts = globalProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleProductClick = (product: any) => {
    navigate(`/product/${encodeURIComponent(product.name)}`);
  };

  if (shopsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar 
          cartCount={0} 
          onCartClick={() => {}} 
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-8">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="hidden lg:block w-72 shrink-0 space-y-8 animate-pulse">
                    <div className="h-8 w-32 bg-slate-100 rounded-lg" />
                    <div className="space-y-3">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-slate-50 rounded-xl" />)}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1,2,3,4,5,6,7,8].map(i => <ProductCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        </div>
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

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#0f9d58]" />
                Categories
              </h2>
              <div className="space-y-3">
                {categories.map(cat => {
                    const isActive = categoryId === cat.id;
                    return (
                        <Link 
                          key={cat.id} 
                          to={`/category/${cat.id}`}
                          className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all border ${isActive ? 'bg-[#0f9d58] text-white border-[#0f9d58] shadow-lg shadow-[#0f9d58]/20 ring-4 ring-emerald-500/10' : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-100'}`}
                        >
                          <span className="text-2xl">{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </Link>
                    );
                })}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Mobile Search/Filter Row */}
            <div className="lg:hidden flex gap-3 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  id="category-mobile-search"
                  name="category-mobile-search"
                  aria-label="Search products"
                  type="text"
                  placeholder={`Search ${categoryId === 'all' ? 'products' : categoryId}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#0f9d58]/30 focus:border-[#0f9d58]/50 outline-none transition-all shadow-sm"
                  autoComplete="off"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors shadow-sm ${showFilters ? 'bg-[#0f9d58] border-[#0f9d58] text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Categories Filter Row */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6 lg:hidden"
                >
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                      <Link 
                        key={cat.id} 
                        to={`/category/${cat.id}`}
                        onClick={() => setShowFilters(false)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${categoryId === cat.id ? 'bg-[#0f9d58] text-white border-[#0f9d58] shadow-md shadow-[#0f9d58]/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-8 px-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{categoryId === 'all' ? 'Fresh Groceries' : categoryId}</h2>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">
                  Found <span className="text-[#0f9d58]">{filteredProducts.length}</span> premium items
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort by:</span>
                <select id="sort-by" name="sort-by" aria-label="Sort by" autoComplete="off" className="bg-transparent text-[11px] font-black text-slate-800 outline-none cursor-pointer">
                   <option>Popularity</option>
                   <option>Price: Low to High</option>
                   <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map(product => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleProductClick(product)}
                  className="cursor-pointer group flex flex-col h-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/20 active:scale-95"
                >
                  <div className="relative aspect-square mb-5 bg-slate-50/50 rounded-2xl overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-slate-600 shadow-sm border border-slate-100 uppercase tracking-widest">
                      In {product.availableInShops} store{product.availableInShops > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <h3 className="font-black text-slate-800 text-base leading-tight mb-1 group-hover:text-[#0f9d58] transition-colors line-clamp-2">{product.name}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-4">{product.unit || '1 unit'}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Starting Price</span>
                        <span className="font-black text-[#0f9d58] text-xl leading-none">₹{product.startingPrice}</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0f9d58] group-hover:bg-[#0f9d58] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-[#0f9d58]/30">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-700">No products found</h3>
                  <p className="text-sm text-slate-500 font-medium">Try searching for something else</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Overlays */}
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
