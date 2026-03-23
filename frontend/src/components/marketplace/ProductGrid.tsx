import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { CategoryPills } from './CategoryPills';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { useProducts } from '@/hooks/useProducts';

interface ProductGridProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
  vendorId: string;
}

export function ProductGrid({ searchQuery, onAddToCart, vendorId }: ProductGridProps) {
  const { products } = useProducts();
  const loading = false; // Mock loading state as it's not yet implemented in the hook
  const [category, setCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === 'all' || p.category === category;
      const matchesShop = p.vendorId === vendorId;
      const isApproved = p.isApproved === true;

      return matchesSearch && matchesCategory && matchesShop && isApproved;
    });
  }, [products, searchQuery, category, vendorId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Fresh Products
        </h2>
        <div className="flex-grow md:max-w-xl scrollbar-hide overflow-x-auto w-full">
          <CategoryPills active={category} onChange={setCategory} />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          >
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product as any}
                onAdd={onAddToCart}
                index={i}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-secondary/30 rounded-[2.5rem] border-2 border-dashed border-border/50"
          >
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Search className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              We couldn't find any products in this shop matching your search.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
