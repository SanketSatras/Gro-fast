import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, X, Home, Briefcase, Trash2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (address: string) => void;
}

const SUGGESTIONS = [
    "Kalyani Nagar, Pune - 411006",
    "Koregaon Park, Pune - 411001",
    "Baner, Pune - 411045",
    "Aundh, Pune - 411007",
    "Viman Nagar, Pune - 411014",
    "Hiranandani, Mumbai - 400076",
    "Indiranagar, Bengaluru - 560038"
];

export function LocationModal({ isOpen, onClose, onSelectLocation }: LocationModalProps) {
    const [search, setSearch] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const { user, updateProfile, isAuthenticated } = useAuth();
    
    // Save address flow states
    const [pendingAddress, setPendingAddress] = useState<{ address: string; pincode: string } | null>(null);
    const [addressLabel, setAddressLabel] = useState<"Home" | "Work" | "Other">("Home");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Guest addresses storage
    const [guestAddresses, setGuestAddresses] = useState<any[]>(() => {
        const saved = localStorage.getItem("grofast-guest-addresses");
        return saved ? JSON.parse(saved) : [];
    });

    const savedAddresses = user ? (user.addresses || []) : guestAddresses;

    const handleCurrentLocation = () => {
        setIsLocating(true);
        setErrorMsg("");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setTimeout(() => {
                        setIsLocating(false);
                        const mockAddress = "Aundh Road, Pune";
                        setPendingAddress({ address: mockAddress, pincode: "411020" });
                    }, 1200);
                },
                (error) => {
                    setIsLocating(false);
                    const mockAddress = "E-Square Mall, Pune";
                    setPendingAddress({ address: mockAddress, pincode: "411016" });
                }
            );
        } else {
            setIsLocating(false);
            setPendingAddress({ address: "Default Pune Hub", pincode: "411001" });
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setErrorMsg("");
        const pinMatch = suggestion.match(/\d{6}/);
        const pincode = pinMatch ? pinMatch[0] : "";
        const cleanAddress = suggestion.replace(/\s*-\s*\d{6}\s*/g, "");
        setPendingAddress({ address: cleanAddress, pincode });
    };

    const handleSaveAddress = async () => {
        if (!pendingAddress?.address || !pendingAddress?.pincode) {
            setErrorMsg("Address and Pincode are required");
            return;
        }

        setIsSaving(true);
        setErrorMsg("");

        try {
            const addressPayload = {
                label: addressLabel,
                address: pendingAddress.address,
                pincode: pendingAddress.pincode
            };

            let savedAddr: any;

            if (isAuthenticated && user) {
                // Save to Backend DB
                savedAddr = await apiFetch('/auth/addresses', {
                    method: 'POST',
                    body: JSON.stringify({ userId: user.id, address: addressPayload })
                });
                
                const currentAddresses = user.addresses || [];
                updateProfile({ addresses: [...currentAddresses, savedAddr] });
            } else {
                // Save to Guest localStorage
                savedAddr = {
                    id: 'addr_' + Date.now(),
                    ...addressPayload
                };
                const updated = [...guestAddresses, savedAddr];
                localStorage.setItem("grofast-guest-addresses", JSON.stringify(updated));
                setGuestAddresses(updated);
            }

            // Set as active location & close modal
            onSelectLocation(`${savedAddr.address}, Pin: ${savedAddr.pincode}`);
            setPendingAddress(null);
            setSearch("");
            onClose();
        } catch (error) {
            console.error("Failed to save address", error);
            setErrorMsg("Failed to save address. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = async (e: React.MouseEvent, addressId: string) => {
        e.stopPropagation(); // Prevent selecting the address on delete click
        setErrorMsg("");

        try {
            if (isAuthenticated && user) {
                // Delete from Backend DB
                await apiFetch(`/auth/addresses/${user.id}/${addressId}`, {
                    method: 'DELETE'
                });
                const updatedAddresses = (user.addresses || []).filter((a: any) => a.id !== addressId);
                updateProfile({ addresses: updatedAddresses });
            } else {
                // Delete from Guest localStorage
                const updated = guestAddresses.filter((a: any) => a.id !== addressId);
                localStorage.setItem("grofast-guest-addresses", JSON.stringify(updated));
                setGuestAddresses(updated);
            }
        } catch (error) {
            console.error("Failed to delete address", error);
            setErrorMsg("Failed to delete address.");
        }
    };

    const filteredSuggestions = search.trim() === "" 
        ? SUGGESTIONS 
        : SUGGESTIONS.filter(s => s.toLowerCase().includes(search.toLowerCase()));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { if (!isSaving) onClose(); }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Wrapper */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[110] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col pointer-events-auto border border-slate-100 max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div className="text-left">
                                    <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-[#0f9d58]" />
                                        {pendingAddress ? "Save Delivery Address" : "Your Location"}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                                        {pendingAddress ? "Tag and save to your list" : "Set delivery destination"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { if (!isSaving) { setPendingAddress(null); onClose(); } }}
                                    className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F6F8FB]">
                                <AnimatePresence mode="wait">
                                    {/* ── FLOW A: SAVE ADDRESS FORM ── */}
                                    {pendingAddress ? (
                                        <motion.div
                                            key="save-address-form"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-5 text-left"
                                        >
                                            {errorMsg && (
                                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    {errorMsg}
                                                </div>
                                            )}

                                            {/* Tag Filter pills */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Save Address As</label>
                                                <div className="flex gap-2">
                                                    {[
                                                        { label: "Home", icon: Home, color: "bg-blue-50 border-blue-200 text-blue-600" },
                                                        { label: "Work", icon: Briefcase, color: "bg-amber-50 border-amber-200 text-amber-600" },
                                                        { label: "Other", icon: MapPin, color: "bg-red-50 border-red-200 text-red-600" }
                                                    ].map((t) => {
                                                        const isSelected = addressLabel === t.label;
                                                        const Icon = t.icon;
                                                        return (
                                                            <button
                                                                key={t.label}
                                                                type="button"
                                                                onClick={() => setAddressLabel(t.label as any)}
                                                                className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all
                                                                    ${isSelected ? `${t.color} ring-2 ring-current/20 scale-105 shadow-sm` : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" />
                                                                {t.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Form Inputs */}
                                            <div className="space-y-3.5">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Address Details</label>
                                                    <textarea
                                                        value={pendingAddress.address}
                                                        onChange={(e) => setPendingAddress({ ...pendingAddress, address: e.target.value })}
                                                        rows={2}
                                                        className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/25 focus:border-[#0f9d58]/40 transition-all resize-none"
                                                        placeholder="House/Flat No, Apartment, Street name"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pincode</label>
                                                    <input
                                                        type="text"
                                                        maxLength={6}
                                                        value={pendingAddress.pincode}
                                                        onChange={(e) => setPendingAddress({ ...pendingAddress, pincode: e.target.value.replace(/\D/g, "") })}
                                                        className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/25 focus:border-[#0f9d58]/40 transition-all"
                                                        placeholder="411033"
                                                    />
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => setPendingAddress(null)}
                                                    className="flex-1 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={handleSaveAddress}
                                                    className="flex-[2] py-3.5 bg-[#0f9d58] hover:bg-[#0d8a4e] text-white rounded-xl text-sm font-black transition-all shadow-md shadow-[#0f9d58]/20 disabled:opacity-70 flex items-center justify-center gap-1.5"
                                                >
                                                    {isSaving ? "Saving..." : "Save Address"}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        /* ── FLOW B: MAIN MODAL INTERFACE ── */
                                        <motion.div
                                            key="main-modal"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            {/* Search input */}
                                            <div className="relative">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    placeholder="Search a new address"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]/25 focus:border-[#0f9d58]/40 transition-all"
                                                />
                                            </div>

                                            {/* Use current location card */}
                                            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#0f9d58]/10 text-[#0f9d58] flex items-center justify-center shrink-0">
                                                    <Navigation className="w-5 h-5 fill-current animate-pulse" />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <h4 className="text-sm font-bold text-slate-800 leading-snug">Use My Current Location</h4>
                                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">Enable your current location for better services</p>
                                                </div>
                                                <button
                                                    onClick={handleCurrentLocation}
                                                    disabled={isLocating}
                                                    className="px-4 py-2 border border-[#0f9d58] text-[#0f9d58] hover:bg-[#0f9d58] hover:text-white rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 disabled:opacity-50"
                                                >
                                                    {isLocating ? "Locating..." : "Enable"}
                                                </button>
                                            </div>

                                            {/* Saved Addresses list */}
                                            {savedAddresses.length > 0 && search.trim() === "" && (
                                                <div className="space-y-2 text-left">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Saved Addresses</h5>
                                                    <div className="grid gap-2">
                                                        {savedAddresses.map((addr: any) => {
                                                            const isHome = addr.label?.toLowerCase() === 'home';
                                                            const isOffice = addr.label?.toLowerCase() === 'office' || addr.label?.toLowerCase() === 'work';
                                                            
                                                            return (
                                                                <div
                                                                    key={addr.id}
                                                                    onClick={() => {
                                                                        onSelectLocation(`${addr.address}, Pin: ${addr.pincode}`);
                                                                        onClose();
                                                                    }}
                                                                    className="w-full text-left p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0f9d58]/20 transition-all flex items-start gap-3 group cursor-pointer relative"
                                                                >
                                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isHome ? 'bg-blue-50 text-blue-600' : isOffice ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                                                        {isHome ? <Home className="w-4 h-4" /> : isOffice ? <Briefcase className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                                    </div>
                                                                    
                                                                    <div className="flex-1 min-w-0 pr-8">
                                                                        <h6 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider leading-none">
                                                                            {addr.label}
                                                                        </h6>
                                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed truncate mt-1">{addr.address}</p>
                                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pin: {addr.pincode}</p>
                                                                    </div>

                                                                    {/* Delete address action */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => handleDeleteAddress(e, addr.id)}
                                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Auto-suggest results or Graphic illustration */}
                                            {search.trim() !== "" ? (
                                                <div className="space-y-2 text-left">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Results</h5>
                                                    <div className="grid gap-2">
                                                        {filteredSuggestions.map((suggestion) => (
                                                            <button
                                                                key={suggestion}
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-700 hover:bg-[#0f9d58]/8 hover:border-[#0f9d58]/20 transition-all flex items-center gap-2.5 group"
                                                            >
                                                                <MapPin className="w-4 h-4 text-slate-300 group-hover:text-[#0f9d58] transition-colors" />
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                        {filteredSuggestions.length === 0 && (
                                                            <p className="text-xs text-slate-400 text-center py-4 font-medium">No addresses found matching "{search}"</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Graphic Illustration */
                                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                                    <svg className="w-40 h-40 drop-shadow-md" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M40 70C40 64.5 44.5 60 50 60C51.2 60 52.4 60.2 53.5 60.7C55.6 57.3 59.4 55 63.8 55C70.5 55 76 60.5 76 67.2C76 67.8 76 68.4 75.9 69C79.4 69.5 82 72.5 82 76C82 79.9 78.9 83 75 83H47C43.1 83 40 79.9 40 76C40 72.5 42.6 69.5 46.1 69C46 68.4 46 67.8 46 67.2" fill="#E2E8F0" opacity="0.6"/>
                                                        <path d="M120 85C120 79.5 124.5 75 130 75C131.2 75 132.4 75.2 133.5 75.7C135.6 72.3 139.4 70 143.8 70C150.5 70 156 75.5 156 82.2C156 82.8 156 83.4 155.9 84C159.4 84.5 162 87.5 162 91C162 94.9 158.9 98 155 98H127C123.1 98 120 94.9 120 91C120 87.5 122.6 84.5 126.1 84" fill="#E2E8F0" opacity="0.6"/>
                                                        <g filter="url(#map-shadow)">
                                                            <path d="M30 150 L75 140 L75 175 L30 185 Z" fill="#E8F5E9" stroke="#A5D6A7" strokeWidth="1.5" />
                                                            <path d="M75 140 L125 145 L125 180 L75 175 Z" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />
                                                            <path d="M125 145 L170 135 L170 170 L125 180 Z" fill="#E8F5E9" stroke="#A5D6A7" strokeWidth="1.5" />
                                                        </g>
                                                        <path d="M45 147 L155 172" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
                                                        <path d="M45 147 L155 172" stroke="#0f9d58" strokeWidth="1.5" strokeDasharray="3, 3" strokeLinecap="round" opacity="0.6"/>
                                                        <line x1="55" y1="145" x2="55" y2="130" stroke="#81C784" strokeWidth="1.5" />
                                                        <circle cx="55" cy="128" r="4" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />
                                                        <line x1="145" y1="140" x2="145" y2="120" stroke="#81C784" strokeWidth="1.5" />
                                                        <circle cx="145" cy="117" r="5" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />
                                                        <ellipse cx="100" cy="143" rx="10" ry="4" fill="black" opacity="0.12" />
                                                        <g className="animate-bounce" style={{ animationDuration: "2s" }}>
                                                            <path d="M100 138 C88 112 82 98 82 85 C82 72 90 62 100 62 C110 62 118 72 118 85 C118 98 112 112 100 138 Z" fill="#FF1744" stroke="#D50000" strokeWidth="1.5"/>
                                                            <circle cx="100" cy="85" r="9" fill="white" />
                                                        </g>
                                                        <defs>
                                                            <filter id="map-shadow" x="-10%" y="-10%" width="120%" height="120%">
                                                                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" />
                                                            </filter>
                                                        </defs>
                                                    </svg>
                                                    <p className="text-xs text-slate-400 font-medium max-w-[200px] mt-2 leading-relaxed">
                                                        Select your address above or let us pinpoint your device's location
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
