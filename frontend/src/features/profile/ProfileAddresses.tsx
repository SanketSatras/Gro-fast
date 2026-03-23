import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, MapPin, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

interface ProfileAddressesProps {
    user: any;
    updateProfile: (data: any) => void;
}

export const ProfileAddresses: React.FC<ProfileAddressesProps> = ({ user, updateProfile }) => {
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState({ label: 'Home', address: '', pincode: '' });

    const handleAddAddress = async () => {
        if (!user) return;
        if (!addressForm.address || !addressForm.pincode) return;

        try {
            const newAddr = await apiFetch('/auth/addresses', {
                method: 'POST',
                body: JSON.stringify({ userId: user.id, address: addressForm })
            });

            const currentAddresses = user.addresses || [];
            updateProfile({ addresses: [...currentAddresses, newAddr] });
            setIsAddingAddress(false);
            setAddressForm({ label: 'Home', address: '', pincode: '' });
        } catch (error) {
            console.error("Failed to add address", error);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;
        try {
            await apiFetch(`/auth/addresses/${user.id}/${addressId}`, {
                method: 'DELETE'
            });
            const updatedAddresses = (user.addresses || []).filter((a: any) => a.id !== addressId);
            updateProfile({ addresses: updatedAddresses });
        } catch (error) {
            console.error("Failed to delete address", error);
        }
    };

    return (
        <div className="space-y-4">
            {isAddingAddress ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white p-6 rounded-3xl border border-emerald-500 shadow-lg space-y-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900">Add New Address</h4>
                        <button onClick={() => setIsAddingAddress(false)} className="text-xs font-bold text-slate-400">Cancel</button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-[10px] font-black uppercase text-slate-400">Label</Label>
                            <div className="flex gap-2 mt-1">
                                {['Home', 'Office', 'Other'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setAddressForm({ ...addressForm, label: l })}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${addressForm.label === l ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                    >
                                        {l === 'Home' && <Home className="w-3 h-3 inline mr-1" />}
                                        {l === 'Office' && <Briefcase className="w-3 h-3 inline mr-1" />}
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] font-black uppercase text-slate-400">Full Address</Label>
                            <Input
                                value={addressForm.address}
                                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                placeholder="House no, Building, Street name"
                                className="rounded-xl border-slate-100 mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] font-black uppercase text-slate-400">Pincode</Label>
                            <Input
                                value={addressForm.pincode}
                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                placeholder="411033"
                                className="rounded-xl border-slate-100 mt-1"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleAddAddress}
                        disabled={!addressForm.address || !addressForm.pincode}
                        className="w-full gradient-emerald rounded-2xl h-12 font-black shadow-emerald"
                    >
                        SAVE ADDRESS
                    </Button>
                </motion.div>
            ) : (
                <>
                    {user?.addresses?.map((addr: any) => (
                        <motion.div
                            layout
                            key={addr.id}
                            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.label === 'Home' ? 'bg-blue-50 text-blue-600' : addr.label === 'Office' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                    {addr.label === 'Home' ? <Home className="w-5 h-5" /> : addr.label === 'Office' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{addr.label}</p>
                                    <p className="text-sm text-slate-500 font-medium">{addr.address}</p>
                                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Pin: {addr.pincode}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    <Button
                        onClick={() => setIsAddingAddress(true)}
                        className="w-full h-16 rounded-3xl border-2 border-dashed border-slate-200 bg-transparent text-slate-400 hover:border-emerald-500 hover:text-emerald-600 font-black transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        ADD NEW ADDRESS
                    </Button>
                </>
            )}
        </div>
    );
};
