import { Clock, Truck, ShoppingBag, Tag, Clock3 } from "lucide-react";

export function ShopInfoCard() {
    const stats = [
        { icon: Clock, label: "Delivery Time", value: "20 min", color: "text-[#0f9d58]", bg: "bg-green-50" },
        { icon: Truck, label: "Delivery Fee", value: "Free", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: ShoppingBag, label: "Min. Order", value: "₹99", color: "text-orange-600", bg: "bg-orange-50" },
        { icon: Clock3, label: "Hours", value: "8am–8pm", color: "text-slate-600", bg: "bg-slate-50" },
    ];

    return (
        <div className="px-4 sm:px-6 -mt-6 relative z-30 max-w-7xl mx-auto">
            {/* Info card floating over the hero */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/8 border border-slate-100 overflow-hidden">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    {stats.map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="flex flex-col items-center justify-center py-5 px-4 gap-2 hover:bg-slate-50/70 transition-colors">
                            <div className={`w-9 h-9 rounded-2xl ${bg} flex items-center justify-center`}>
                                <Icon className={`w-4.5 h-4.5 ${color}`} />
                            </div>
                            <span className="font-black text-slate-800 text-sm">{value}</span>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Promo strip */}
                <div className="border-t border-dashed border-slate-100 bg-gradient-to-r from-[#0f9d58]/5 to-transparent px-6 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                        <Tag className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                        🎉 Get <span className="font-black text-[#0f9d58]">10% off</span> on orders above ₹499 — use code{" "}
                        <span className="font-mono font-black bg-[#0f9d58]/10 text-[#0f9d58] px-1.5 py-0.5 rounded">FRESH10</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
