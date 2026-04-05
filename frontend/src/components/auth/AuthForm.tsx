import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Store, ShieldCheck, User, MapPin } from "lucide-react";

interface AuthFormProps {
    role: UserRole;
    title: string;
}

export function AuthForm({ role, title }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [shopName, setShopName] = useState("");
    const [shopLocation, setShopLocation] = useState("");
    const [shopCategory, setShopCategory] = useState("Groceries");
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === "admin") navigate("/admin");
            else if (user.role === "vendor") navigate("/vendor");
            else if (user.role === "delivery") navigate("/delivery");
            else navigate("/");
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // New validation rules for Register and Reset
        if (!isLogin) {
            if (!email.toLowerCase().endsWith('@gmail.com')) {
                toast.error("Only @gmail.com emails are allowed");
                return;
            }
            if (!/^\+91\d{10}$/.test(phone)) {
                toast.error("Phone must be +91 followed by 10 digits");
                return;
            }
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(password)) {
                toast.error("Password needs 8+ chars, uppercase, number, and a symbol");
                return;
            }
        }

        setIsLoading(true);
        try {
            if (isReset) {
                await apiFetch('/auth/reset-password', {
                    method: 'POST',
                    body: JSON.stringify({ email, newPassword: password }),
                });
                toast.success("Password reset successful! Please log in.");
                setIsReset(false);
                setIsLogin(true);
                return;
            }

            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const userData = await apiFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    phone,
                    role,
                    ...(role === 'vendor' && !isLogin ? { shopName, shopLocation, shopCategory } : {})
                }),
            });

            login(userData);
            toast.success(`${isLogin ? "Welcome back" : "Account created"} as ${role.toUpperCase()}!`);

            // Role-based redirection using the role returned from backend
            if (userData.role === "admin") navigate("/admin");
            else if (userData.role === "vendor") navigate("/vendor");
            else if (userData.role === "delivery") navigate("/delivery");
            else navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to authenticate. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-12 space-y-10 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100/50 animate-in fade-in zoom-in duration-500 overflow-y-auto max-h-[95vh] scrollbar-hide relative">
            <div className="text-center space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-100 mb-4 p-3">
                        <img src="/icon-512.png" alt="Grofast Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-800 uppercase leading-none">
                        GRO <span className="text-[#10B981] italic">FAST</span>
                    </h1>
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">{isReset ? "RESET PASSWORD" : title}</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#94a3b8] mt-3">
                        {isReset ? "ENTER YOUR EMAIL FOR PASSWORD RECOVERY" : (isLogin ? "ACCESS YOUR " + role + " PORTAL" : "JOIN OUR " + role + " NETWORK")}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && !isReset && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-2">FULL NAME</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-[#10B981] font-bold text-slate-600 px-6 shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-2">PHONE NUMBER</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+91 9876543210"
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || val.startsWith("+91")) {
                                        setPhone(val);
                                    } else if (!val.startsWith("+")) {
                                        setPhone("+91" + val);
                                    }
                                }}
                                autoComplete="tel"
                                className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-[#10B981] font-bold text-slate-600 px-6 shadow-sm"
                                required
                            />
                            {!isLogin && phone && !/^\+91\d{10}$/.test(phone) && (
                                <p className="text-[9px] text-rose-500 font-bold ml-2">Format: +91XXXXXXXXXX</p>
                            )}
                        </div>

                        {role === 'vendor' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-6 pt-2 border-t border-slate-50"
                            >
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#10B981] mb-2 opacity-60 text-center">SHOP IDENTITY</p>
                                <div className="space-y-2">
                                    <Label htmlFor="shopName" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-2">SHOP NAME</Label>
                                    <Input
                                        id="shopName"
                                        name="shopName"
                                        placeholder="e.g. Rolex Mart"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        autoComplete="organization"
                                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-[#10B981] font-bold text-slate-600 px-6 shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shopLocation" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-2">SHOP LOCATION</Label>
                                    <Input
                                        id="shopLocation"
                                        name="shopLocation"
                                        placeholder="e.g. Wakad, Pune"
                                        value={shopLocation}
                                        onChange={(e) => setShopLocation(e.target.value)}
                                        autoComplete="street-address"
                                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-[#10B981] font-bold text-slate-600 px-6 shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shopCategory" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-2">SHOP TYPE</Label>
                                    <select
                                        id="shopCategory"
                                        name="shopCategory"
                                        autoComplete="off"
                                        className="w-full h-16 px-6 rounded-2xl bg-slate-50/50 border border-slate-100 text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#10B981] transition-all outline-none text-slate-600 shadow-sm"
                                        value={shopCategory}
                                        onChange={(e) => setShopCategory(e.target.value)}
                                    >
                                        <option value="Groceries">Groceries</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Fruits">Fruits</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] ml-2">EMAIL ADDRESS</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        autoComplete="email"
                        className={`h-16 rounded-2xl border-slate-100 focus-visible:ring-[#10B981] font-black px-6 placeholder:text-slate-400 shadow-sm ${!isLogin && email && !email.toLowerCase().endsWith('@gmail.com') ? 'bg-rose-50 text-rose-900' : 'bg-[#ebf2ff] text-slate-800'}`}
                        required
                    />
                    {!isLogin && email && !email.toLowerCase().endsWith('@gmail.com') && (
                        <p className="text-[9px] text-rose-500 font-bold ml-2">Must be a @gmail.com address</p>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2">
                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">{"PASSWORD"}</Label>
                        {isLogin && !isReset && (
                            <button
                                type="button"
                                onClick={() => setIsReset(true)}
                                className="text-[9px] font-black uppercase tracking-widest text-[#10B981] hover:underline"
                            >
                                FORGOT PASSWORD?
                            </button>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className={`h-16 rounded-2xl border-slate-100 focus-visible:ring-[#10B981] font-black px-6 text-xl shadow-sm ${!isLogin && password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password) ? 'bg-rose-50 text-rose-900' : 'bg-[#ebf2ff] text-slate-800'}`}
                        required
                    />
                    {!isLogin && password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password) && (
                        <p className="text-[9px] text-rose-500 font-bold ml-2 leading-tight">Required: 8+ chars, 1 Uppercase, 1 Number, 1 Special Symbol</p>
                    )}
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-16 bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm uppercase tracking-[0.2em] rounded-[1.25rem] shadow-xl shadow-emerald-100/50 transition-all mt-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? "PROCESSING..." : (isReset ? "CONFIRM RESET" : (isLogin ? "SIGN IN NOW" : "REGISTER WITH US"))}
                </Button>
            </form>

            <div className="text-center pt-2 space-y-4">
                {isReset ? (
                    <button
                        onClick={() => setIsReset(false)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#10B981] transition-colors block mx-auto px-4 py-2"
                    >
                        Back to Login
                    </button>
                ) : (
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] hover:text-[#10B981] transition-colors block mx-auto py-2"
                    >
                        {isLogin ? "New to GROFAST? Create Account" : "Already have an account? Log In"}
                    </button>
                )}
            </div>
        </div>
    );
}
