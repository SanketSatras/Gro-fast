import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/lib/data';
import { toast } from 'sonner';

const CART_KEY = 'grofast-cart';

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Helper to show the custom out-of-stock toast
const showStockToast = () => {
  toast.custom((t) => (
    <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-100 max-w-sm w-full mx-auto pointer-events-auto">
      <div className="w-10 h-10 rounded-xl bg-[#fff8e6] flex items-center justify-center shrink-0 border border-orange-100">
        <span className="text-xl">🛍️</span>
      </div>
      <p className="text-sm font-semibold text-slate-700 leading-snug">
        Sorry, we have limited quantity available for this item!
      </p>
    </div>
  ), { position: 'top-center', duration: 3000, id: 'stock-limit-toast' });
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    const existing = items.find(i => i.id === product.id);
    
    if (existing) {
      if (product.stock !== undefined && existing.quantity >= product.stock) {
        showStockToast();
        return;
      }
      setItems(items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      if (product.stock !== undefined && product.stock <= 0) {
        showStockToast();
        return;
      }
      setItems([...items, { ...product, quantity: 1 }]);
    }
    
    setIsOpen(true);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const existing = items.find(i => i.id === id);
    if (!existing) return;

    if (quantity <= 0) {
      setItems(items.filter(i => i.id !== id));
      return;
    }

    let finalQuantity = quantity;
    if (existing.stock !== undefined && quantity > existing.stock) {
      showStockToast();
      finalQuantity = existing.stock;
    }

    setItems(items.map(i => i.id === id ? { ...i, quantity: finalQuantity } : i));
  }, [items]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal };
}
