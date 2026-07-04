import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Minus, Plus, Trash2, ShoppingBag, X, Zap, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '@/lib/data';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: CartItem[];
    subtotal: number;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&fit=crop&q=60';

export function CartDrawer({ open, onOpenChange, items, subtotal, onUpdateQuantity, onRemove }: CartDrawerProps) {
    const navigate = useNavigate();

    const savings = Math.round(subtotal * 0.05); // example: 5% you could make dynamic
    const total = subtotal;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                className="w-full sm:max-w-[400px] flex flex-col p-0 gap-0 bg-[#F6F8FB] border-l border-slate-100"
            >
                {/* ── Header ── */}
                <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#0f9d58] flex items-center justify-center shadow-md shadow-[#0f9d58]/25">
                                <ShoppingBag className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 leading-none">My Cart</h2>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                    {items.length === 0 ? 'No items' : `${items.length} item${items.length > 1 ? 's' : ''} added`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    {/* Free delivery banner */}
                    {items.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 bg-[#0f9d58]/8 border border-[#0f9d58]/15 rounded-xl px-3 py-2">
                            <Zap className="w-3.5 h-3.5 text-[#0f9d58] shrink-0" />
                            <p className="text-[11px] font-bold text-[#0f9d58]">
                                🎉 You get FREE delivery on this order!
                            </p>
                        </div>
                    )}
                </div>

                {/* ── EMPTY STATE ── */}
                <AnimatePresence mode="wait">
                    {items.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center"
                        >
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center">
                                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#0f9d58]/10 border border-[#0f9d58]/20 flex items-center justify-center">
                                    <span className="text-sm">🛒</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Your cart is empty</h3>
                                <p className="text-sm text-slate-400 font-medium mt-1 max-w-[200px] mx-auto">
                                    Add items from the store to get started
                                </p>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#0f9d58] text-white font-bold text-sm rounded-xl hover:bg-[#0d8a4e] transition-colors shadow-md shadow-[#0f9d58]/20"
                            >
                                Browse Stores <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ) : (

                        /* ── ITEMS LIST ── */
                        <motion.div key="items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                <AnimatePresence initial={false}>
                                    {items.map(item => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="flex gap-3 bg-white rounded-2xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            {/* Image */}
                                            <div className="w-[68px] h-[68px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                                <img
                                                    src={item.image || FALLBACK_IMG}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-800 truncate leading-snug">{item.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.unit}</p>
                                                </div>
                                                <p className="text-sm font-black text-slate-900">
                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                    {item.quantity > 1 && (
                                                        <span className="text-[10px] font-semibold text-slate-400 ml-1.5">
                                                            ₹{item.price} each
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Qty + Delete */}
                                            <div className="flex flex-col items-end justify-between shrink-0">
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>

                                                <div className="flex items-center gap-0 bg-[#0f9d58]/8 border border-[#0f9d58]/20 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-[#0f9d58] hover:bg-[#0f9d58]/15 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-7 text-center text-sm font-black text-[#0f9d58]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-[#0f9d58] hover:bg-[#0f9d58]/15 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Promo code row */}
                                <div className="flex gap-2 pt-1">
                                    <div className="flex-1 flex items-center gap-2 bg-white border border-dashed border-slate-200 rounded-xl px-3 py-2.5">
                                        <Tag className="w-4 h-4 text-slate-300 shrink-0" />
                                        <span className="text-xs text-slate-400 font-medium">Add promo code</span>
                                    </div>
                                    <button className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* ── Bill Summary ── */}
                            <div className="bg-white border-t border-slate-100 px-5 pt-4 pb-5 space-y-3 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.06)]">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Bill Summary</h4>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Subtotal</span>
                                        <span className="font-bold text-slate-800">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Delivery fee</span>
                                        <span className="font-bold text-[#0f9d58] flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> FREE
                                        </span>
                                    </div>
                                    {savings > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">You save</span>
                                            <span className="font-bold text-[#0f9d58]">− ₹{savings}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-3 border-t border-slate-100">
                                    <span className="font-black text-slate-900">Total</span>
                                    <span className="font-black text-slate-900 text-lg">₹{total.toLocaleString()}</span>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between px-5 py-4 bg-[#0f9d58] rounded-2xl text-white shadow-xl shadow-[#0f9d58]/25 hover:bg-[#0d8a4e] transition-colors mt-1"
                                    onClick={() => { onOpenChange(false); navigate('/checkout'); }}
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                            {items.length} item{items.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-sm font-black">Proceed to Checkout</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black">₹{total.toLocaleString()}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </motion.button>

                                <p className="text-center text-[10px] text-slate-400 font-medium">
                                    🔒 Secure checkout · All payments encrypted
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
}
