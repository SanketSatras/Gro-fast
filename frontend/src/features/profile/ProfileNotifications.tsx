import React from 'react';
import { motion } from 'framer-motion';

interface ProfileNotificationsProps {
    user: any;
    updateProfile: (data: any) => void;
}

export const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({ user, updateProfile }) => {
    
    const togglePreference = (key: 'orderUpdates' | 'promotions') => {
        if (!user) return;
        const newPrefs = { ...user.preferences, [key]: !user.preferences?.[key] };
        updateProfile({ preferences: newPrefs as any });
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Alert Preferences</h4>
            <div className="space-y-4">
                {[
                    { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified about your delivery status' },
                    { key: 'promotions', label: 'Offer & Discounts', desc: 'Personalized deals and vouchers' }
                ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-900">{pref.label}</p>
                            <p className="text-xs text-slate-400 font-medium">{pref.desc}</p>
                        </div>
                        <button
                            onClick={() => togglePreference(pref.key as any)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${user?.preferences?.[pref.key as keyof typeof user.preferences] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                            <motion.div
                                animate={{ x: user?.preferences?.[pref.key as keyof typeof user.preferences] ? 26 : 4 }}
                                className="w-4 h-4 bg-white rounded-full absolute top-1"
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
