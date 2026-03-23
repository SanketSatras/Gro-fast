import { ShoppingCart, Search, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Navbar({ cartCount, onCartClick, searchQuery, onSearchChange }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50"
    >
      <div className="max-w-[1440px] mx-auto px-4 py-4 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center shrink-0 gap-3">
          <img src="/icon-512.png" alt="Grofast Logo" className="w-16 h-16 object-contain" />
          <span className="text-4xl font-black tracking-tighter uppercase flex items-center gap-1.5">
            <span className="text-slate-900">GRO</span>
            <span className="text-[#0f9d58]">FAST</span>
          </span>
        </Link>

        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="navbar-search"
              name="navbar-search"
              aria-label="Search products"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search fresh groceries, bakery..."
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/80 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.role === 'vendor' && (
                <Link to="/vendor" className="p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors hidden sm:flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-bold">Dashboard</span>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-900 transition-colors hidden sm:flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-bold">Admin</span>
                </Link>
              )}
              {user?.role === 'delivery' && (
                <Link to="/delivery" className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors hidden sm:flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-bold">Deliveries</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-secondary/50 border border-border/50 group hover:border-emerald-500/50 hover:bg-emerald-50 transition-all">
                <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-0.5">Customer</p>
                  <p className="text-xs font-bold text-foreground leading-none">{user?.name}</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/customer">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs font-bold px-4">Login</Button>
              </Link>
              <Link to="/auth/vendor">
                <Button size="sm" className="rounded-xl text-xs font-bold gradient-emerald text-white px-4 border-none">As Vendor</Button>
              </Link>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onCartClick}
            className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full gradient-emerald text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-white"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
