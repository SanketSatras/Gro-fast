import { Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function HomeHeader() {
    const { user } = useAuth();

    return (
        <div className="bg-[#0f9d58] pt-12 pb-24 px-4 rounded-b-[3rem] relative z-10 w-full overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -ml-32 -mb-32 blur-2xl" />

            <div className="max-w-7xl mx-auto relative">
                <div className="flex justify-between items-center mb-10">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden bg-white/20 border border-white/30 hover:bg-white/30 transition-all shadow-lg">
                                <span className="text-white font-black text-lg">
                                    {user?.name?.charAt(0) || "U"}
                                </span>
                            </Link>
                            <div>
                                <p className="text-white/70 text-[10px] uppercase tracking-widest font-black mb-0.5">Welcome back</p>
                                <p className="text-white text-lg font-bold leading-none">{user?.name} 👋</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/auth/customer">
                                <button className="px-5 py-2.5 rounded-2xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/20 hover:bg-white/20 transition-all">
                                    Login
                                </button>
                            </Link>
                            <Link to="/auth/customer">
                                <button className="px-5 py-2.5 rounded-2xl bg-white text-[#0f9d58] font-bold text-xs uppercase tracking-wider border border-white hover:bg-slate-50 transition-all shadow-xl shadow-black/10">
                                    Join GroFast
                                </button>
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                         <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Location Selector Card - Adaptive width */}
                <div className="mt-4">
                    <div className="bg-white p-5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-black/10 cursor-pointer max-w-sm md:max-w-md border border-white hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
                                <MapPin className="w-5 h-5 text-[#0f9d58]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">Delivery to</p>
                                <p className="text-base font-bold text-slate-800 leading-tight">Chandler street, London</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                             <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 rotate-45" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
