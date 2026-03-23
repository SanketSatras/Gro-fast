import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    date: string;
    total: number;
    status: string;
    items: OrderItem[];
    blockchainHash?: string;
}

interface ProfileOrdersProps {
    displayOrders: Order[];
}

export const ProfileOrders: React.FC<ProfileOrdersProps> = ({ displayOrders }) => {
    const navigate = useNavigate();
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {displayOrders.length > 0 ? displayOrders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full p-6 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 uppercase tracking-tighter">ORD-{order.id.slice(-6)}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="font-black text-slate-900">₹{order.total}</p>
                                <Badge className="bg-emerald-50 text-emerald-700 border-none uppercase text-[8px] font-black px-1.5 h-4">
                                    {order.status}
                                </Badge>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    <AnimatePresence>
                        {expandedOrder === order.id && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 pt-0 border-t border-slate-50">
                                <div className="space-y-3 mt-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium">{item.name} × {item.quantity}</span>
                                            <span className="font-bold">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full mt-4 rounded-xl border-dashed font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                                        Download Invoice
                                    </Button>
                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                        <Button 
                                            onClick={() => navigate(`/order-tracking/${order.id}`)}
                                            className="w-full mt-2 rounded-xl gradient-emerald text-white font-bold"
                                        >
                                            Track Order
                                        </Button>
                                    )}
                                    {order.blockchainHash && (
                                        <div className="flex justify-center mt-4">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100/50" title={`TxHash: ${order.blockchainHash}`}>
                                                <CheckCircle className="w-3 h-3" /> VERIFIED ON BLOCKCHAIN
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <ShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders placed yet</p>
                </div>
            )}
        </div>
    );
};
