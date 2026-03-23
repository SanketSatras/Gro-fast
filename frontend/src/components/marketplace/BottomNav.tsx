import { Home, Search, ShoppingBag, Store, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavProps {
  cartCount: number;
  onCartClick: () => void;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/' },
  { icon: ShoppingBag, label: 'Cart', path: '#cart' },
  { icon: Store, label: 'Vendor', path: '/vendor' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export function BottomNav({ cartCount, onCartClick }: BottomNavProps) {
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bottom-nav md:hidden"
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === location.pathname && label !== 'Cart';
          const isCart = label === 'Cart';

          if (isCart) {
            return (
              <button
                key={label}
                onClick={onCartClick}
                className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
              >
                <div className="relative">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full gradient-emerald text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              to={path}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
