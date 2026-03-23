import { motion } from 'framer-motion';
import { Truck, MapPin, CheckCircle2, Navigation, LogOut, Package, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { useMemo } from 'react';

export default function DeliveryDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { orders, updateOrderStatus } = useOrders();

    const activeOrders = useMemo(() => {
        return orders.filter(o => o.status === 'preparing' || o.status === 'out_for_delivery');
    }, [orders]);

    const completedOrdersCount = useMemo(() => {
        return orders.filter(o => o.status === 'delivered').length;
    }, [orders]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleViewMap = (address: string, pincode: string) => {
        const query = encodeURIComponent(`${address}, ${pincode}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
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
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">PARTNER: {user?.name || 'Driver'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 bg-[#f0fbf7] pl-3 pr-8 py-2.5 rounded-full hover:bg-[#e8f5ed] transition-all cursor-pointer group/badge"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#10b981] group-hover/badge:scale-105 transition-transform">
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Delivery Partner</p>
                                    <p className="text-[11px] font-black text-slate-800 leading-none tracking-wide">{user?.name || 'Driver'}</p>
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group lg:p-4">
                                <LogOut className="w-5 h-5 lg:w-6 lg:h-6" />
                            </button>
                        </div>

                        <button 
                            onClick={handleLogout} 
                            className="md:hidden p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero / Stats Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 sm:mb-14"
                >
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/20">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 sm:-mr-8 sm:-mt-8 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col h-full bg-cover justify-between">
                            <div className="flex items-start justify-between mb-8 sm:mb-12">
                                <div>
                                    <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Active Deliveries</p>
                                    <h2 className="text-6xl sm:text-7xl font-black leading-none">{activeOrders.length}</h2>
                                </div>
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                    <Truck className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <p className="text-blue-100/90 text-sm max-w-sm leading-relaxed font-medium">
                                {activeOrders.length === 0 
                                    ? "You're all caught up! Waiting for new orders to arrive from the restaurants." 
                                    : "You have active orders waiting to be delivered. Click 'View Map' to guide your route!"}
                            </p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex items-start justify-between h-full flex-col sm:flex-row gap-6">
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Total Completed
                                    </p>
                                    <h2 className="text-6xl sm:text-7xl font-black text-slate-800 leading-none mb-4">{completedOrdersCount}</h2>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">Successful global deliveries achieved</p>
                            </div>
                            <div className="hidden sm:flex h-full items-center justify-center self-center w-full sm:w-auto mt-4 sm:mt-0">
                                <div className="w-32 h-32 rounded-full border-[10px] sm:border-[12px] border-slate-50 flex items-center justify-center relative">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle 
                                            cx="64" cy="64" r="52" 
                                            className="text-slate-100 stroke-current" 
                                            strokeWidth="12" fill="none"
                                        />
                                        <circle 
                                            cx="64" cy="64" r="52" 
                                            className="text-emerald-500 stroke-current drop-shadow-md" 
                                            strokeWidth="12" fill="none" 
                                            strokeDasharray="326" 
                                            strokeDashoffset={completedOrdersCount === 0 ? 326 : 326 - (326 * Math.min(completedOrdersCount / 100, 1))}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <Package className="w-10 h-10 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Orders Grid Section */}
                <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Navigation className="w-6 h-6 text-blue-600 p-1 bg-blue-100 rounded-lg" />
                            Your Task Board
                        </h2>
                    </div>

                    {activeOrders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeOrders.map((order, index) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={order.id}
                                    className="bg-white flex flex-col rounded-3xl border border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Top Status Bar */}
                                    <div className={`h-2.5 w-full ${order.status === 'preparing' ? 'bg-amber-400' : 'bg-blue-500'}`} />
                                    
                                    <div className="p-6 sm:p-7 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="inline-block px-3 py-1 font-mono text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 rounded-md mb-3 border border-slate-200 uppercase tracking-wider">
                                                    Order #{order.id.slice(0, 8)}
                                                </span>
                                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{order.customer.name}</h3>
                                            </div>
                                            <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full ring-2 ring-offset-2 flex items-center gap-1.5 whitespace-nowrap
                                                ${order.status === 'preparing' 
                                                    ? 'bg-amber-100 text-amber-700 ring-amber-200' 
                                                    : 'bg-blue-100 text-blue-700 ring-blue-200'}`}
                                            >
                                                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${order.status === 'preparing' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'} `}></span>
                                                {order.status === 'preparing' ? 'PREPARING' : 'ON THE WAY'}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 mb-6 border border-slate-100 grow flex flex-col">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white shadow-sm rounded-xl shrink-0">
                                                    <MapPin className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 line-clamp-3 leading-relaxed mb-1.5">
                                                        {order.customer.address}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-slate-500 font-mono font-medium">Pin: {order.customer.pincode}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => handleViewMap(order.customer.address, order.customer.pincode)}
                                                className="w-full sm:flex-1 bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-600 text-slate-700 rounded-xl h-12 shadow-sm font-bold text-sm"
                                            >
                                                <MapPin className="w-4 h-4 mr-2" />
                                                View Map
                                            </Button>
                                            
                                            {order.status === 'preparing' && (
                                                <Button 
                                                    onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} 
                                                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl h-12 shadow-md shadow-blue-600/20 font-bold transition-all text-sm"
                                                >
                                                    Start Delivery
                                                </Button>
                                            )}
                                            {order.status === 'out_for_delivery' && (
                                                <Button 
                                                    onClick={() => updateOrderStatus(order.id, 'delivered')} 
                                                    className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl h-12 shadow-md shadow-emerald-500/20 font-bold transition-all text-sm"
                                                >
                                                    Mark Done
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-16 sm:py-24 px-6 text-center shadow-sm w-full"
                        >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 sm:mb-4">No Active Deliveries</h3>
                            <p className="text-sm sm:text-base text-slate-500 max-w-sm sm:max-w-md mx-auto leading-relaxed">
                                Your queue is currently empty. Take a break, stay hydrated, and stand by until new orders arrive.
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

