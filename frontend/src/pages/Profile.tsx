import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    ShoppingBag,
    ChevronRight,
    LogOut,
    ArrowLeft,
    CreditCard,
    Bell,
    Package,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';

import { ProfileOrders } from '@/features/profile/ProfileOrders';
import { ProfileAddresses } from '@/features/profile/ProfileAddresses';
import { ProfileSettings } from '@/features/profile/ProfileSettings';
import { ProfileNotifications } from '@/features/profile/ProfileNotifications';
import { ProfilePayments } from '@/features/profile/ProfilePayments';

export default function Profile() {
    const { user, logout, updateProfile } = useAuth();
    const { orders } = useOrders();
    const { products } = useProducts();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings' | 'addresses' | 'payments' | 'notifications'>('profile');
    
    // Shop state for vendors
    const [shop, setShop] = useState<any>(null);

    const isVendor = user?.role === 'vendor';
    const isDelivery = user?.role === 'delivery';

    useEffect(() => {
        const fetchShop = async () => {
            if (isVendor && user?.id) {
                try {
                    const shopData = await apiFetch(`/shops/vendor/${user.id}`);
                    setShop(shopData);
                } catch (error) {
                    console.error("Failed to fetch shop details", error);
                }
            }
        };
        fetchShop();
    }, [isVendor, user?.id]);

    const vendorProducts = useMemo(() => {
        if (!isVendor || !user) return [];
        return products.filter(p => p.vendorId === user.id);
    }, [isVendor, user, products]);

    const vendorOrders = useMemo(() => {
        if (!isVendor || !user) return [];
        return orders.filter(o => o.vendorId === user.id);
    }, [isVendor, user, orders]);

    const customerOrders = useMemo(() => {
        if (!user) return [];
        return orders.filter(o =>
            o.userId === user.id ||
            (o.customer?.name?.toLowerCase() === user.name?.toLowerCase())
        ).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [orders, user]);

    const deliveredOrders = useMemo(() => {
        if (!isDelivery) return [];
        return orders.filter(o => o.status === 'delivered').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [isDelivery, orders]);

    const displayOrders = isVendor ? vendorOrders : isDelivery ? deliveredOrders : customerOrders;

    const statsMetrics = useMemo(() => {
        if (isVendor) {
            return [
                { label: 'Live Products', value: vendorProducts.length, icon: Package },
                { label: 'Store Sales', value: `₹${vendorOrders.reduce((acc, o) => acc + (o.total || 0), 0)}`, icon: TrendingUp, color: 'text-blue-600' }
            ];
        }
        if (isDelivery) {
            return [
                { label: 'Total Deliveries', value: deliveredOrders.length, icon: Package },
                { label: 'Earnings', value: `₹${deliveredOrders.length * 30}`, icon: TrendingUp, color: 'text-emerald-600' }
            ];
        }
        return [
            { label: 'Total Orders', value: customerOrders.length, icon: ShoppingBag },
            { label: 'Spent', value: `₹${customerOrders.reduce((acc, o) => acc + (o.total || 0), 0)}`, icon: TrendingUp, color: 'text-emerald-600' }
        ];
    }, [isVendor, isDelivery, vendorProducts, vendorOrders, customerOrders, deliveredOrders]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { id: 'orders', label: isVendor ? 'Store Orders' : isDelivery ? 'Delivery History' : 'My Orders', icon: ShoppingBag, color: 'text-[#0f9d58]', bg: 'bg-emerald-50', badge: displayOrders.length },
        { id: 'settings', label: 'Account Settings', icon: Settings, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'addresses', label: 'Addresses', icon: Settings, color: 'text-blue-500', bg: 'bg-blue-50' }, // Added to ensure reachable
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50', badge: 0 },
        { id: 'payments', label: isDelivery ? 'Earnings & Payouts' : 'Payment Methods', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => activeTab === 'profile' ? navigate(-1) : setActiveTab('profile')}
                            className="p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-800" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                {activeTab === 'profile' ? (
                    <>
                        {/* User Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-8 overflow-hidden"
                        >
                            <div className="flex items-center gap-8">
                                <div className="w-28 h-28 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100 overflow-hidden p-2">
                                    <img src="/icon-512.png" alt="Grofast Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{user?.name}</h2>
                                        <Badge className="bg-emerald-100 text-[#0f9d58] hover:bg-emerald-100 border-none uppercase text-[8px] font-black px-2 tracking-widest leading-none">
                                            {isVendor ? 'Certified Vendor' : isDelivery ? 'Official Partner' : 'Verified Member'}
                                        </Badge>
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm mb-6 lowercase">{user?.email}</p>

                                    <div className="flex items-center gap-10">
                                        {statsMetrics.map((stat, i) => (
                                            <div key={i} className="text-center">
                                                <p className={`text-xl font-black ${stat.color || 'text-slate-800'} leading-none mb-1`}>{stat.value}</p>
                                                <p className="text-[9px] text-[#2D3748] font-black uppercase tracking-widest opacity-60 whitespace-nowrap">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Menu Items */}
                        <div className="grid gap-4">
                            {menuItems.map((item, i) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className="flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-slate-100 transition-all group hover:border-emerald-200 hover:shadow-md active:scale-[0.98]"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-sm`}>
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xl font-black text-slate-800 tracking-tight leading-tight">{item.label}</p>
                                        <p className="text-[11px] text-slate-400 font-bold tracking-tight mt-0.5">Manage your account information</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 text-[10px] flex items-center justify-center font-black border border-slate-100">
                                                {item.badge}
                                            </span>
                                        )}
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full mt-8 rounded-2xl h-14 text-slate-400 hover:text-destructive hover:bg-destructive/5 font-bold"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Log Out from Device
                        </Button>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {activeTab === 'orders' && <ProfileOrders displayOrders={displayOrders as any} />}
                        {activeTab === 'addresses' && <ProfileAddresses user={user} updateProfile={updateProfile} />}
                        {activeTab === 'settings' && <ProfileSettings user={user} updateProfile={updateProfile} shop={shop} setShop={setShop} isVendor={isVendor} />}
                        {activeTab === 'notifications' && <ProfileNotifications user={user} updateProfile={updateProfile} />}
                        {activeTab === 'payments' && <ProfilePayments />}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
