import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, X, Check, Home, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
    const { user } = useAuth();

    const handleCurrentLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setTimeout(() => {
                        setIsLocating(false);
                        const mockAddress = "Aundh Road, Pune - 411020 (My Current Location)";
                        onSelectLocation(mockAddress);
                        onClose();
                    }, 1200);
                },
                (error) => {
                    setIsLocating(false);
                    const mockAddress = "E-Square Mall, Pune - 411016 (Detected Location)";
                    onSelectLocation(mockAddress);
                    onClose();
                }
            );
        } else {
            setIsLocating(false);
            onSelectLocation("Default Pune Hub - 411001");
            onClose();
        }
    };

    const filteredSuggestions = search.trim() === "" 
        ? SUGGESTIONS 
        : SUGGESTIONS.filter(s => s.toLowerCase().includes(search.toLowerCase()));

    const savedAddresses = user?.addresses || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                                        Your Location
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Set delivery destination</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F6F8FB]">
                                {/* Search address */}
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

                                {/* Saved Addresses Section (Zomato/Swiggy style) */}
                                {user && savedAddresses.length > 0 && search.trim() === "" && (
                                    <div className="space-y-2 text-left">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Saved Addresses</h5>
                                        <div className="grid gap-2">
                                            {savedAddresses.map((addr: any) => {
                                                const isHome = addr.label?.toLowerCase() === 'home';
                                                const isOffice = addr.label?.toLowerCase() === 'office' || addr.label?.toLowerCase() === 'work';
                                                
                                                return (
                                                    <button
                                                        key={addr.id}
                                                        onClick={() => {
                                                            onSelectLocation(`${addr.address}, Pin: ${addr.pincode}`);
                                                            onClose();
                                                        }}
                                                        className="w-full text-left p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0f9d58]/20 transition-all flex items-start gap-3 group"
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isHome ? 'bg-blue-50 text-blue-600' : isOffice ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                                            {isHome ? <Home className="w-4 h-4" /> : isOffice ? <Briefcase className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h6 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider leading-none">
                                                                {addr.label}
                                                            </h6>
                                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed truncate mt-1">{addr.address}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pin: {addr.pincode}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions list */}
                                {search.trim() !== "" ? (
                                    <div className="space-y-2 text-left">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Search Results</h5>
                                        <div className="grid gap-2">
                                            {filteredSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => {
                                                        onSelectLocation(suggestion);
                                                        onClose();
                                                    }}
                                                    className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100 text-xs font-bold text-slate-700 hover:bg-[#0f9d58]/8 hover:border-[#0f9d58]/20 transition-all flex items-center gap-2.5 group"
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
                                    /* Beautiful Map Illustration matching request */
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <svg className="w-48 h-48 drop-shadow-md" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Clouds */}
                                            <path d="M40 70C40 64.5 44.5 60 50 60C51.2 60 52.4 60.2 53.5 60.7C55.6 57.3 59.4 55 63.8 55C70.5 55 76 60.5 76 67.2C76 67.8 76 68.4 75.9 69C79.4 69.5 82 72.5 82 76C82 79.9 78.9 83 75 83H47C43.1 83 40 79.9 40 76C40 72.5 42.6 69.5 46.1 69C46 68.4 46 67.8 46 67.2C46 67.2 46 67.2 46 67.2" fill="#E2E8F0" opacity="0.6"/>
                                            <path d="M120 85C120 79.5 124.5 75 130 75C131.2 75 132.4 75.2 133.5 75.7C135.6 72.3 139.4 70 143.8 70C150.5 70 156 75.5 156 82.2C156 82.8 156 83.4 155.9 84C159.4 84.5 162 87.5 162 91C162 94.9 158.9 98 155 98H127C123.1 98 120 94.9 120 91C120 87.5 122.6 84.5 126.1 84" fill="#E2E8F0" opacity="0.6"/>
                                            
                                            {/* Map Base (Folded perspective panels) */}
                                            <g filter="url(#map-shadow)">
                                                {/* Left Panel */}
                                                <path d="M30 150 L75 140 L75 175 L30 185 Z" fill="#E8F5E9" stroke="#A5D6A7" strokeWidth="1.5" />
                                                {/* Middle Panel */}
                                                <path d="M75 140 L125 145 L125 180 L75 175 Z" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />
                                                {/* Right Panel */}
                                                <path d="M125 145 L170 135 L170 170 L125 180 Z" fill="#E8F5E9" stroke="#A5D6A7" strokeWidth="1.5" />
                                            </g>

                                            {/* Map Roads */}
                                            <path d="M45 147 L155 172" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
                                            <path d="M45 147 L155 172" stroke="#0f9d58" strokeWidth="1.5" strokeDasharray="3, 3" strokeLinecap="round" opacity="0.6"/>
                                            
                                            {/* Pins in background */}
                                            <line x1="55" y1="145" x2="55" y2="130" stroke="#81C784" strokeWidth="1.5" />
                                            <circle cx="55" cy="128" r="4" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />
                                            
                                            <line x1="145" y1="140" x2="145" y2="120" stroke="#81C784" strokeWidth="1.5" />
                                            <circle cx="145" cy="117" r="5" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5" />

                                            {/* Main Pin pinpoint circle */}
                                            <ellipse cx="100" cy="143" rx="10" ry="4" fill="black" opacity="0.12" />
                                            
                                            {/* Floating Main Pin */}
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
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
