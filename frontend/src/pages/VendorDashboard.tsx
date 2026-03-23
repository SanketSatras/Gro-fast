import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, AlertTriangle, DollarSign, ShoppingCart, ArrowLeft, Plus, Download, Pencil, Trash2, LogOut, Box, Clock, User, MapPin, CheckCircle, Hourglass, XCircle, TrendingUp, PieChart as PieIcon, BarChart3, Truck } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { categories, Product, ProductRequest } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useShops } from '@/hooks/useShops';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { initNotifications, sendLocalNotification } from '@/lib/notifications';

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { products, productRequests, requestProduct, deleteProduct, updateProductStock } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'orders' | 'analytics' | 'whatsapp'>('inventory');
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  // Shop Creation Form State
  const [shopForm, setShopForm] = useState({
    name: '',
    shopName: '',
    location: '',
    category: 'Groceries',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop'
  });

  const [formData, setFormData] = useState({
    name: '',
    category: 'groceries',
    price: '',
    stock: '',
    unit: '',
  });

  useEffect(() => {
    const fetchShop = async () => {
      if (!user?.id) return;
      try {
        const data = await apiFetch(`/shops/vendor/${user.id}`);
        setShop(data);
      } catch (error) {
        console.error("Error fetching shop:", error);
      } finally {
        setIsLoadingShop(false);
      }
    };
    fetchShop();
    initNotifications();
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (activeTab === 'whatsapp' && user?.id) {
      const fetchStatus = async () => {
        try {
          const status = await apiFetch(`/vendor/whatsapp/status/${user.id}`);
          setWhatsappStatus(status);
        } catch (error) {
          console.error("Error fetching WhatsApp status:", error);
        }
      };
      
      fetchStatus();
      interval = setInterval(fetchStatus, 5000); // Check every 5s
    }
    return () => clearInterval(interval);
  }, [activeTab, user]);

  const handleConnectWhatsApp = async () => {
    if (!user?.id) return;
    try {
      setIsConnecting(true);
      await apiFetch(`/vendor/whatsapp/connect/${user.id}`, { method: 'POST' });
      toast.success("WhatsApp initialization started. Please wait for the QR code.");
    } catch (error: any) {
      toast.error("Failed to start WhatsApp: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopForm.shopName || !shopForm.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreatingShop(true);
      const newShop = await apiFetch('/shops', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: user?.id,
          name: shopForm.shopName,
          location: shopForm.location,
          category: shopForm.category,
          image: shopForm.image
        })
      });
      setShop(newShop);
      toast.success("Shop created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create shop");
    } finally {
      setIsCreatingShop(false);
    }
  };

  // Filter products by current vendor
  const vendorProducts = useMemo(() => {
    return products.filter(p => p.vendorId === user?.id);
  }, [user, products]);

  // Filter requests by current vendor
  const vendorRequests = useMemo(() => {
    return productRequests.filter(r => r.vendorId === user?.id);
  }, [user, productRequests]);

  // Filter orders by current vendor
  const vendorOrders = useMemo(() => {
    return orders.filter(o => o.vendorId === user?.id);
  }, [user, orders]);

  const stats = useMemo(() => {
    return [
      { label: 'Live Products', value: vendorProducts.length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { label: 'Pending Requests', value: vendorRequests.filter(r => r.status === 'pending').length, icon: Hourglass, color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Inventory Value', value: `₹${vendorProducts.reduce((s, p) => s + (p.price * p.stock), 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'New Orders', value: vendorOrders.filter(o => o.status === 'pending').length, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];
  }, [vendorProducts, vendorRequests, vendorOrders]);

  // --- Analytics Data Processing ---
  const revenueData = useMemo(() => {
    const dailyRevenue: Record<string, number> = {};
    const sortedOrders = [...vendorOrders]
      .filter(o => o.status === 'delivered')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedOrders.forEach(order => {
      const date = order.date.split(' ')[0] || order.date;
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.total || 0);
    });

    return Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [vendorOrders]);

  const orderStatusData = useMemo(() => {
    const counts = {
      pending: vendorOrders.filter(o => o.status === 'pending').length,
      preparing: vendorOrders.filter(o => o.status === 'preparing').length,
      delivered: vendorOrders.filter(o => o.status === 'delivered').length,
    };
    return [
      { name: 'Pending', value: counts.pending, color: '#f59e0b' },
      { name: 'Preparing', value: counts.preparing, color: '#3b82f6' },
      { name: 'Delivered', value: counts.delivered, color: '#10b981' },
    ].filter(item => item.value > 0);
  }, [vendorOrders]);

  const topProductsData = useMemo(() => {
    const productSales: Record<string, { name: string, sales: number }> = {};
    
    vendorOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, sales: 0 };
        }
        productSales[item.id].sales += item.quantity || 1;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [vendorOrders]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    requestProduct({
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      unit: formData.unit || '1 unit',
      vendorId: user?.id || 'unknown',
    });

    toast.success("Product request sent to Admin for approval.");
    setIsAdding(false);
    setFormData({ name: '', category: 'groceries', price: '', stock: '', unit: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/vendor');
  };

  const handleStockUpdate = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateProductStock(productId, newStock);
      toast.success("Stock updated successfully");
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  if (isLoadingShop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-emerald-50/50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-emerald-200/50 overflow-hidden border border-emerald-100"
        >
          <div className="p-12">
            <div className="text-center space-y-4 mb-10">
              <div className="w-20 h-20 rounded-[2rem] gradient-emerald flex items-center justify-center shadow-emerald mx-auto mb-6">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none uppercase">CREATE YOUR SHOP</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Complete your profile to start selling</p>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-shop-name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Shop Official Name</Label>
                  <Input
                    id="create-shop-name"
                    name="create-shop-name"
                    placeholder="e.g. Royal Fresh Groceries"
                    value={shopForm.shopName}
                    onChange={e => setShopForm({ ...shopForm, shopName: e.target.value })}
                    autoComplete="organization"
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500 font-bold text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-shop-location" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Location / Area</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="create-shop-location"
                      name="create-shop-location"
                      placeholder="e.g. Civil Lines, Nagpur"
                      value={shopForm.location}
                      onChange={e => setShopForm({ ...shopForm, location: e.target.value })}
                      autoComplete="street-address"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:ring-emerald-500 font-bold pl-12"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-shop-category" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Shop Category</Label>
                    <select
                      id="create-shop-category"
                      name="create-shop-category"
                      autoComplete="off"
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      value={shopForm.category}
                      onChange={e => setShopForm({ ...shopForm, category: e.target.value })}
                    >
                      {categories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.label}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Banner Action</Label>
                    <div className="h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 italic">
                      Standard Image Applied
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isCreatingShop}
                className="w-full h-16 gradient-emerald text-white font-black text-sm uppercase tracking-widest rounded-[1.5rem] shadow-emerald hover:opacity-90 transition-all mt-6"
              >
                {isCreatingShop ? "Activating Portal..." : "Launch My Shop Ready"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="p-2 hover:bg-slate-50 rounded-full transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-800" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <img src="/icon-512.png" alt="Grofast Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-[28px] font-black text-[#0f9d58] tracking-tighter uppercase leading-none">GROFAST</h1>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">VENDOR: {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-3 bg-[#f0fbf7] pl-3 pr-8 py-2.5 rounded-full hover:bg-[#e8f5ed] transition-all cursor-pointer group/badge"
              >
                <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#10b981] group-hover/badge:scale-105 transition-transform">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Official Vendor</p>
                  <p className="text-[11px] font-black text-slate-800 leading-none tracking-wide">{user?.name}</p>
                </div>
              </Link>
              <button
               onClick={handleLogout} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group lg:p-4">
                <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <button 
                onClick={() => sendLocalNotification('Hello Vendor!', { body: 'This is a test notification from Grofast.' })}
                className="p-3 rounded-2xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all lg:p-4"
                title="Test Notifications"
              >
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            <Link 
              to="/auth/delivery"
              target="_blank"
              className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all text-[10px] font-bold uppercase tracking-[0.15em] h-10 shadow-none border-none"
            >
              <Truck className="w-3.5 h-3.5" /> Delivery Login
            </Link>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
              <DialogTrigger asChild>
                <Button className="hidden md:flex bg-[#0f9d58] hover:bg-[#0b8043] text-white rounded-full h-10 px-6 font-bold uppercase text-[10px] tracking-[0.15em] shadow-none">
                  <Plus className="w-3.5 h-3.5 mr-2" /> Request Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-slate-800">New Product Request</DialogTitle>
                  <DialogDescription className="text-slate-500">
                    Submit your product details. Admin will assign a standard image and approve it.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequest} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name" className="text-slate-600 font-bold ml-1">Product Name</Label>
                      <Input id="product-name" name="product-name" autoComplete="off" placeholder="e.g. Fresh Red Apples" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-2xl border-slate-200 h-12 focus-visible:ring-emerald-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-category" className="text-slate-600 font-bold ml-1">Category</Label>
                        <select id="product-category" name="product-category" autoComplete="off" className="w-full h-12 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          {categories.filter(c => c.id !== 'all').map(cat => (<option key={cat.id} value={cat.id}>{cat.label}</option>))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-unit" className="text-slate-600 font-bold ml-1">Unit</Label>
                        <Input id="product-unit" name="product-unit" autoComplete="off" placeholder="e.g. 1 kg" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="rounded-2xl border-slate-200 h-12" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-price" className="text-slate-600 font-bold ml-1">Price (₹)</Label>
                        <Input id="product-price" name="product-price" autoComplete="off" type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="rounded-2xl border-slate-200 h-12" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-stock" className="text-slate-600 font-bold ml-1">Stock</Label>
                        <Input id="product-stock" name="product-stock" autoComplete="off" type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="rounded-2xl border-slate-200 h-12" required />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="pt-6">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-emerald-100">
                      SUBMIT REQUEST
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between aspect-square md:aspect-auto md:min-h-[140px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800 leading-none mb-2 tracking-tight">{stat.value}</p>
                <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Tab Bar */}
        <div className="flex flex-nowrap overflow-x-auto gap-2 mb-6 bg-white p-1.5 rounded-full border border-slate-100 w-fit shadow-sm max-w-full no-scrollbar">
          <Button variant={activeTab === 'inventory' ? 'default' : 'ghost'} onClick={() => setActiveTab('inventory')}
            className={`rounded-full font-bold px-6 md:px-8 h-10 text-xs whitespace-nowrap ${activeTab === 'inventory' ? 'bg-[#0f9d58] text-white hover:bg-[#0b8043]' : 'text-slate-500 hover:bg-slate-50'}`}>
            Live Inventory
          </Button>
          <Button variant={activeTab === 'requests' ? 'default' : 'ghost'} onClick={() => setActiveTab('requests')}
            className={`rounded-full font-bold px-6 md:px-8 h-10 text-xs relative whitespace-nowrap ${activeTab === 'requests' ? 'bg-[#0f9d58] text-white hover:bg-[#0b8043]' : 'text-slate-500 hover:bg-slate-50'}`}>
            Requests
            {vendorRequests.some(r => r.status === 'pending') && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </Button>
          <Button variant={activeTab === 'orders' ? 'default' : 'ghost'} onClick={() => setActiveTab('orders')}
            className={`rounded-full font-bold px-6 md:px-8 h-10 text-xs whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#0f9d58] text-white hover:bg-[#0b8043]' : 'text-slate-500 hover:bg-slate-50'}`}>
            Orders
          </Button>
          <Button variant={activeTab === 'analytics' ? 'default' : 'ghost'} onClick={() => setActiveTab('analytics')}
            className={`rounded-full font-bold px-6 md:px-8 h-10 text-xs whitespace-nowrap ${activeTab === 'analytics' ? 'bg-[#0f9d58] text-white hover:bg-[#0b8043]' : 'text-slate-500 hover:bg-slate-50'}`}>
            Analytics 📊
          </Button>
          <Button variant={activeTab === 'whatsapp' ? 'default' : 'ghost'} onClick={() => setActiveTab('whatsapp')}
            className={`rounded-full font-bold px-6 md:px-8 h-10 text-xs whitespace-nowrap ${activeTab === 'whatsapp' ? 'bg-[#0f9d58] text-white hover:bg-[#0b8043]' : 'text-slate-500 hover:bg-slate-50'}`}>
            WhatsApp 📱
          </Button>
        </div>

        {/* Content Section */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-slate-50">
                  <TableHead className="py-4 px-6 md:px-8 font-black text-slate-400 uppercase tracking-[0.15em] text-[9px]">Product Info</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-[0.15em] text-[9px]">Category</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-[0.15em] text-[9px]">Price</TableHead>
                  <TableHead className="hidden md:table-cell font-black text-slate-400 uppercase tracking-[0.15em] text-[9px]">Stock Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right px-8 font-black text-slate-400 uppercase tracking-[0.15em] text-[9px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorProducts.length > 0 ? vendorProducts.map((p) => (
                  <TableRow key={p.id} className="border-b border-slate-50/50 last:border-0 hover:bg-slate-50/30 transition-colors">
                    <TableCell className="py-4 px-6 md:px-8">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100" />
                        <div>
                          <p className="font-bold text-slate-800 text-[13px]">{p.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full font-bold uppercase text-[9px] tracking-[0.15em] px-3 py-1 bg-blue-50/50 text-blue-600 border-none`}>
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 text-[13px]">₹{p.price}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-2 w-32">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleStockUpdate(p.id, p.stock, -1)}
                            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className={`text-[10px] font-black ${p.stock < 10 ? 'text-red-500' : 'text-slate-800'}`}>{p.stock} Units</span>
                          <button 
                            onClick={() => handleStockUpdate(p.id, p.stock, 1)}
                            className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200"
                          >
                            +
                          </button>
                        </div>
                        <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.stock < 10 ? 'bg-red-500' : 'bg-[#0f9d58]'}`} style={{ width: `${Math.min((p.stock / 50) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right px-8">
                      <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                        <Trash2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-500" />
                      </button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">Your inventory is empty.</p>
                      <p className="text-xs text-slate-400 mt-1">Submit a request to start selling.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorRequests.map((r) => (
              <motion.div key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-slate-800 leading-tight">{r.name}</h3>
                    {r.status === 'pending' && <Badge className="bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-100 font-black tracking-widest text-[9px] uppercase"><Hourglass className="w-3 h-3 mr-1" /> Pending</Badge>}
                    {r.status === 'approved' && <Badge className="bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-100 font-black tracking-widest text-[9px] uppercase"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>}
                    {r.status === 'rejected' && <Badge className="bg-red-100 text-red-600 rounded-xl hover:bg-red-100 font-black tracking-widest text-[9px] uppercase"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-400 mb-8">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest mb-1">Price</p>
                      <p className="text-slate-800 text-xl font-black">₹{r.price}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest mb-1">Qty</p>
                      <p className="text-slate-800 text-xl font-black">{r.stock} {r.unit}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300 font-bold">RQ: {r.id}</span>
                  <span className="text-[10px] text-slate-300 font-bold uppercase">{r.requestDate}</span>
                </div>
              </motion.div>
            ))}
            {vendorRequests.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Box className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending requests</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {vendorOrders.map(o => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-100">
                        #{o.id}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {o.date}
                      </span>
                    </div>
                    {o.blockchainHash && (
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50/80 px-3 py-1.5 rounded-lg w-fit mt-3 border border-emerald-100/50" title={`TxHash: ${o.blockchainHash}`}>
                        <CheckCircle className="w-3 h-3" /> VERIFIED ON BLOCKCHAIN
                      </div>
                    )}

                    <div className="mt-4">
                      <h4 className="text-2xl font-black text-slate-800 mb-1 lg:text-3xl tracking-tight">{o.customer.name}</h4>
                      <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        {o.customer.address}, {o.customer.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-6 h-full justify-between">
                    <select
                      id={`order-status-${o.id}`}
                      name={`order-status-${o.id}`}
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                      className={`px-6 h-12 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] border-none shadow-sm transition-all cursor-pointer
                            ${o.status === 'pending' ? 'bg-[#FFF9E6] text-[#D9A300] ring-1 ring-[#FFECB3]' :
                          o.status === 'preparing' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' :
                          o.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-100' :
                            'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </select>

                    <p className="text-4xl font-black text-slate-800 tracking-tighter">₹{o.total}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {vendorOrders.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <ShoppingCart className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">No Active Orders</h3>
                <p className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase mt-2">Your store is ready for customers</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Revenue Area Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Revenue Trend</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Earnings from delivered orders</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="h-[300px] w-full">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <TrendingUp className="w-8 h-8 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No delivered orders yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Status Pie Chart */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Order Distribution</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Breakdown by status</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <PieIcon className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  {orderStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <PieIcon className="w-8 h-8 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No orders to analyze</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Top Products Bar Chart */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Top Products</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Best selling items</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  {topProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                          width={100}
                        />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar 
                          dataKey="sales" 
                          fill="#10b981" 
                          radius={[0, 8, 8, 0]} 
                          barSize={20}
                        >
                          {topProductsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <BarChart3 className="w-8 h-8 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No sales data recorded</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center mx-auto">
                <Store className="w-10 h-10 text-[#0f9d58]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">WHATSAPP NOTIFICATIONS</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Connect your independent WhatsApp to notify your customers</p>
              </div>

              {!whatsappStatus?.initialized ? (
                <div className="py-12 px-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold mb-6">Your WhatsApp engine is not yet initialized.</p>
                  <Button 
                    onClick={handleConnectWhatsApp}
                    disabled={isConnecting}
                    className="h-16 px-10 gradient-emerald text-white font-black rounded-2xl shadow-emerald uppercase tracking-widest text-xs"
                  >
                    {isConnecting ? "Initializing..." : "Start WhatsApp Engine"}
                  </Button>
                </div>
              ) : whatsappStatus.isReady ? (
                <div className="py-12 px-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-black text-xl uppercase tracking-tight">Independent Connection Active</p>
                    <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mt-1">Customers will receive messages from your number</p>
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest">
                    SYSTEM READY
                  </Badge>
                </div>
              ) : (
                <div className="py-12 px-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center gap-8">
                  {whatsappStatus.qrCode ? (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-[2rem] shadow-inner border-2 border-slate-50 inline-block">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(whatsappStatus.qrCode)}`}
                          alt="WhatsApp QR Code"
                          className="w-[250px] h-[250px] rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-800 font-black text-lg uppercase tracking-tight">Scan QR Code</p>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Open WhatsApp {'>'} Linked Devices {'>'} Link a Device</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Generating Secure QR...</p>
                    </div>
                  )}
                  <div className="w-full pt-8 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Session ID: {whatsappStatus.vendorId}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {[
                  { title: 'Order Success', desc: 'Auto-send confirmation details' },
                  { title: 'Delivery Alert', desc: 'Notify on successful handover' },
                  { title: 'Cancel Notice', desc: 'Direct info on cancellations' },
                ].map((feature, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">{feature.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold leading-tight">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => setIsAdding(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0f9d58] rounded-full shadow-lg shadow-[#0f9d58]/40 flex md:hidden items-center justify-center text-white z-50 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
