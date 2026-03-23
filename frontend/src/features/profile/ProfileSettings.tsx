import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

interface ProfileSettingsProps {
    user: any;
    updateProfile: (data: any) => void;
    shop: any;
    setShop: (data: any) => void;
    isVendor: boolean;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, updateProfile, shop, setShop, isVendor }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState(user?.email || '');
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState(user?.phone || '');
    const [isEditingShopName, setIsEditingShopName] = useState(false);
    const [newShopName, setNewShopName] = useState(shop?.name || '');
    const [isEditingShopLocation, setIsEditingShopLocation] = useState(false);
    const [newShopLocation, setNewShopLocation] = useState(shop?.location || '');
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleUpdateName = async () => {
        if (!user || !newName.trim()) return;
        try {
            const updatedUser = await apiFetch('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ id: user.id, name: newName })
            });
            updateProfile({ name: updatedUser.name });
            setIsEditingName(false);
        } catch (error) {
            console.error("Failed to update name", error);
        }
    };

    const handleUpdateEmail = async () => {
        if (!user || !newEmail.trim()) return;
        try {
            const updatedUser = await apiFetch('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ id: user.id, email: newEmail })
            });
            updateProfile({ email: updatedUser.email || newEmail });
            setIsEditingEmail(false);
        } catch (error: any) {
            console.error("Failed to update email", error);
            window.alert(error.message || 'Failed to update email');
        }
    };

    const handleUpdatePhone = async () => {
        if (!user || !newPhone.trim()) return;
        try {
            const updatedUser = await apiFetch('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ id: user.id, phone: newPhone })
            });
            updateProfile({ phone: updatedUser.phone });
            setIsEditingPhone(false);
        } catch (error) {
            console.error("Failed to update phone", error);
            window.alert('Failed to update phone');
        }
    };

    const handleUpdateShop = async () => {
        if (!user || !isVendor) return;
        try {
            const updatedShop = await apiFetch(`/shops/vendor/${user.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: newShopName, location: newShopLocation })
            });
            setShop(updatedShop);
            setIsEditingShopName(false);
            setIsEditingShopLocation(false);
        } catch (error) {
            console.error("Failed to update shop details", error);
            window.alert('Failed to update shop details');
        }
    };

    const handleUpdatePassword = async () => {
        if (!user || !newPassword.trim()) return;
        try {
            await apiFetch('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({ id: user.id, password: newPassword })
            });
            setIsEditingPassword(false);
            setNewPassword('');
            window.alert('Password updated successfully!');
        } catch (error) {
            console.error("Failed to update password", error);
            window.alert('Failed to update password');
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
            <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Personal Info</h4>
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Name</p>
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-8 rounded-lg border-slate-200 text-sm font-bold bg-white"
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={handleUpdateName} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-black uppercase">Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} className="h-8 text-[10px] font-black uppercase">Cancel</Button>
                                </div>
                            ) : (
                                <p className="font-bold text-slate-900">{user?.name}</p>
                            )}
                        </div>
                        {!isEditingName && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setNewName(user?.name || '');
                                    setIsEditingName(true);
                                }}
                                className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50"
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Email Address</p>
                            {isEditingEmail ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="h-8 rounded-lg border-slate-200 text-sm font-bold bg-white"
                                        autoFocus
                                        type="email"
                                    />
                                    <Button size="sm" onClick={handleUpdateEmail} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-black uppercase">Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingEmail(false)} className="h-8 text-[10px] font-black uppercase">Cancel</Button>
                                </div>
                            ) : (
                                <p className="font-bold text-slate-900">{user?.email}</p>
                            )}
                        </div>
                        {!isEditingEmail && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setNewEmail(user?.email || '');
                                    setIsEditingEmail(true);
                                }}
                                className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50"
                            >
                                Edit
                            </Button>
                        )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Contact Number</p>
                            {isEditingPhone ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        className="h-8 rounded-lg border-slate-200 text-sm font-bold bg-white"
                                        autoFocus
                                        type="tel"
                                    />
                                    <Button size="sm" onClick={handleUpdatePhone} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-black uppercase">Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingPhone(false)} className="h-8 text-[10px] font-black uppercase">Cancel</Button>
                                </div>
                            ) : (
                                <p className="font-bold text-slate-900">{user?.phone || 'Not set'}</p>
                            )}
                        </div>
                        {!isEditingPhone && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setNewPhone(user?.phone || '');
                                    setIsEditingPhone(true);
                                }}
                                className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50"
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {isVendor && (
                <div className="pt-8 border-t border-slate-50">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Shop Info</h4>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Shop Name</p>
                                {isEditingShopName ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newShopName}
                                            onChange={(e) => setNewShopName(e.target.value)}
                                            className="h-8 rounded-lg border-slate-200 text-sm font-bold bg-white"
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleUpdateShop} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-black uppercase">Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditingShopName(false)} className="h-8 text-[10px] font-black uppercase">Cancel</Button>
                                    </div>
                                ) : (
                                    <p className="font-bold text-slate-900">{shop?.name || 'My Shop'}</p>
                                )}
                            </div>
                            {!isEditingShopName && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setNewShopName(shop?.name || '');
                                        setIsEditingShopName(true);
                                    }}
                                    className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                    Edit
                                </Button>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Shop Address</p>
                                {isEditingShopLocation ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={newShopLocation}
                                            onChange={(e) => setNewShopLocation(e.target.value)}
                                            className="h-8 rounded-lg border-slate-200 text-sm font-bold bg-white"
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleUpdateShop} className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-black uppercase">Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditingShopLocation(false)} className="h-8 text-[10px] font-black uppercase">Cancel</Button>
                                    </div>
                                ) : (
                                    <p className="font-bold text-slate-900">{shop?.location || 'Not set'}</p>
                                )}
                            </div>
                            {!isEditingShopLocation && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setNewShopLocation(shop?.location || '');
                                        setIsEditingShopLocation(true);
                                    }}
                                    className="text-emerald-600 font-bold hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="pt-8 border-t border-slate-50">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Security</h4>

                <AnimatePresence mode="wait">
                    {isEditingPassword ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100"
                        >
                            <div>
                                <Label className="text-[10px] font-black uppercase text-slate-400">New Password</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter at least 6 characters"
                                    className="rounded-xl border-slate-200 mt-1 bg-white"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleUpdatePassword}
                                    disabled={newPassword.length < 6}
                                    className="flex-1 gradient-emerald rounded-xl h-12 font-black shadow-emerald"
                                >
                                    UPDATE PASSWORD
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditingPassword(false)}
                                    className="rounded-xl h-12 font-bold px-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <Button
                            onClick={() => setIsEditingPassword(true)}
                            className="w-full rounded-2xl h-14 bg-[#FFC529] hover:bg-[#FFB000] text-slate-900 font-black text-sm shadow-lg shadow-amber-100 transition-all border-none"
                        >
                            Update Password
                        </Button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
