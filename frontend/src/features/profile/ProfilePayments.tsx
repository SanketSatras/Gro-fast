import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProfilePayments: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-black italic">VISA</div>
                    <div>
                        <p className="font-bold text-slate-900">•••• 4242</p>
                        <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Expires 12/26</p>
                    </div>
                </div>
                <Badge className="bg-slate-100 text-slate-400 border-none uppercase text-[8px] font-black">Primary</Badge>
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center text-white">₹</div>
                <div>
                    <p className="font-bold text-slate-900">GROFAST Wallet</p>
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Balance: ₹0.00</p>
                </div>
            </div>
            <Button className="w-full h-16 rounded-3xl border-2 border-dashed border-slate-200 bg-transparent text-slate-400 hover:border-emerald-500 hover:text-emerald-600 font-black transition-all">
                + ADD NEW CARD / UPI
            </Button>
        </div>
    );
};
