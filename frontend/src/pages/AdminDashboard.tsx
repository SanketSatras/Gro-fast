import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store, LineChart, ShieldCheck, Activity, ShoppingBag,
    ArrowLeft, CheckCircle, XCircle, Image as ImageIcon,
    Search, LayoutDashboard, ClipboardList, ScrollText,
    TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
    ChevronRight, LogOut, Menu, X, Filter, Clock,
    Package, Users, IndianRupee, Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useShops } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/* ─── Types ──────────────────────────────────────────────── */
type Tab = 'overview' | 'shops' | 'approvals' | 'logs';

interface Log {
    id: string;
    timestamp: string;
    type: string;
    action: string;
    target: string;
    performedBy: string;
    details: string;
}

/* ─── Variants ───────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg, trend }: {
    label: string; value: string | number; icon: React.ElementType;
    color: string; bg: string; trend?: { value: number; positive: boolean };
}) {
    return (
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-border/40 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
            {/* subtle bg blob */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${bg}`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${bg} ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend.value)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
        </motion.div>
    );
}

/* ─── Sidebar Nav Item ───────────────────────────────────── */
function NavItem({ icon: Icon, label, active, onClick, badge }: {
    icon: React.ElementType; label: string; active: boolean;
    onClick: () => void; badge?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative
                ${active
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center
                    ${active ? 'bg-white/20 text-white' : 'bg-destructive text-white'}`}>
                    {badge}
                </span>
            )}
            {active && <ChevronRight className="w-3 h-3 opacity-60" />}
        </button>
    );
}

/* ─── Log Type Badge ─────────────────────────────────────── */
function LogTypeBadge({ type }: { type: string }) {
    const map: Record<string, string> = {
        shop: 'bg-amber-50 text-amber-600 border-amber-100',
        product: 'bg-blue-50 text-blue-600 border-blue-100',
        order: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        auth: 'bg-violet-50 text-violet-600 border-violet-100',
    };
    const cls = map[type] ?? 'bg-slate-50 text-slate-600 border-slate-100';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${cls}`}>
            {type}
        </span>
    );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { products, productRequests, updateRequestStatus } = useProducts();
    const { orders } = useOrders();
    const { shops, deleteShop } = useShops();

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [adminImage, setAdminImage] = useState('');
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [logSearch, setLogSearch] = useState('');
    const [logFilter, setLogFilter] = useState('all');
    const [shopSearch, setShopSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* ── Data ── */
    const fetchLogs = useCallback(async () => {
        try {
            setIsLoadingLogs(true);
            const data = await apiFetch('/admin/logs');
            setLogs(data);
        } catch {
            toast.error('Failed to load system logs');
        } finally {
            setIsLoadingLogs(false);
        }
    }, []);

    useEffect(() => { if (activeTab === 'logs') fetchLogs(); }, [activeTab, fetchLogs]);

    /* ── Stats ── */
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        const pendingApprovals = productRequests.filter(r => r.status === 'pending').length;
        return [
            { label: 'Live Products', value: products.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10', trend: { value: 12, positive: true } },
            { label: 'Active Shops', value: shops.length, icon: Store, color: 'text-amber-600', bg: 'bg-amber-100', trend: { value: 4, positive: true } },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: { value: 8, positive: true } },
            { label: 'Pending Approvals', value: pendingApprovals, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100', trend: { value: 2, positive: false } },
        ];
    }, [products, orders, productRequests, shops]);

    /* ── Filtered Logs ── */
    const filteredLogs = useMemo(() => logs.filter(l => {
        const matchSearch = logSearch === '' || [l.action, l.target, l.performedBy, l.details].join(' ').toLowerCase().includes(logSearch.toLowerCase());
        const matchType = logFilter === 'all' || l.type === logFilter;
        return matchSearch && matchType;
    }), [logs, logSearch, logFilter]);

    /* ── Filtered Shops ── */
    const filteredShops = useMemo(() =>
        shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())),
        [shops, shopSearch]);

    /* ── Actions ── */
    const handleApprove = (id: string) => {
        if (!adminImage) { toast.error('Please provide a product image URL first.'); return; }
        updateRequestStatus(id, 'approved', adminImage);
        toast.success('Product approved and published!');
        setSelectedRequest(null);
        setAdminImage('');
    };

    const handleReject = (id: string) => {
        updateRequestStatus(id, 'rejected');
        toast.info('Request rejected.');
        setSelectedRequest(null);
    };

    const handleDeleteShop = async (shopId: string) => {
        if (confirm('Delete this shop and all its products?')) {
            try { await deleteShop(shopId); } catch (e) { console.error(e); }
        }
    };

    const pendingCount = productRequests.filter(r => r.status === 'pending').length;

    const navItems: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'shops', label: 'Shops', icon: Store },
        { id: 'approvals', label: 'Requests', icon: ClipboardList, badge: pendingCount },
        { id: 'logs', label: 'Activity Logs', icon: ScrollText },
    ];

    const logTypes = ['all', 'order', 'shop', 'product', 'auth'];

    /* ─────────────────────────────────────────── JSX ── */
    return (
        <div className="min-h-screen bg-[#F4F6FA] flex flex-col">

            {/* ── Top Header ── */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link to="/" className="p-2 rounded-xl hover:bg-secondary transition-colors">
                            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <img src="/icon-512.png" alt="Grofast" className="w-7 h-7 object-contain" />
                            <span className="text-lg font-black tracking-tighter">
                                <span className="text-foreground">GRO</span>
                                <span className="text-primary">FAST</span>
                            </span>
                            <span className="hidden sm:block text-muted-foreground/30 font-light">|</span>
                            <span className="hidden sm:block text-xs font-black tracking-[0.2em] uppercase text-muted-foreground">Admin Console</span>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <button
                                onClick={() => setActiveTab('approvals')}
                                className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                        )}
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-sm font-bold leading-none">{user?.name}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">System Admin</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-sm font-black text-primary">{user?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={logout}
                            className="hidden sm:flex items-center gap-1.5 rounded-xl h-9 border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-bold text-[11px] uppercase tracking-wider transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6">

                {/* ── Sidebar ── */}
                <AnimatePresence>
                    {(sidebarOpen || true) && (
                        <motion.aside
                            initial={false}
                            className={`
                                ${sidebarOpen ? 'fixed inset-0 z-40 flex' : 'hidden lg:flex'}
                                lg:relative lg:w-56 lg:shrink-0 flex-col
                            `}
                        >
                            {/* Mobile overlay */}
                            {sidebarOpen && (
                                <div className="absolute inset-0 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                            )}
                            <div className={`
                                relative z-10 flex flex-col gap-1 w-56 bg-white rounded-2xl border border-border/50 shadow-sm p-3 h-fit
                                ${sidebarOpen ? 'ml-0 mt-16' : ''}
                            `}>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3 pt-1 pb-2">Navigation</p>
                                {navItems.map(item => (
                                    <NavItem
                                        key={item.id}
                                        icon={item.icon}
                                        label={item.label}
                                        active={activeTab === item.id}
                                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                        badge={item.badge}
                                    />
                                ))}

                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3 pb-2">System</p>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                                            <span className="text-[11px] font-bold text-emerald-700">DB Status</span>
                                            <span className="flex items-center gap-1 text-[11px] font-black text-emerald-600">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                Online
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                                            <span className="text-[11px] font-bold text-primary">Security</span>
                                            <span className="text-[11px] font-black text-primary flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" />
                                                Protected
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile logout */}
                                <button
                                    onClick={logout}
                                    className="lg:hidden mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* ── Main Content ── */}
                <main className="flex-1 min-w-0 space-y-6">

                    {/* ── OVERVIEW ── */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                                {/* Page title */}
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Dashboard Overview</h2>
                                    <p className="text-sm text-muted-foreground font-medium mt-0.5">Welcome back, {user?.name}. Here's what's happening.</p>
                                </div>

                                {/* Stat Cards */}
                                <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {stats.map((s) => <StatCard key={s.label} {...s} />)}
                                </motion.div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                            <div>
                                                <h3 className="font-black text-foreground">Recent Orders</h3>
                                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Latest transactions</p>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('logs')} className="text-[11px] font-bold text-primary gap-1 hover:bg-primary/5">
                                                View All <ChevronRight className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="divide-y divide-border/30">
                                            {orders.slice(0, 6).map((o, i) => (
                                                <motion.div key={o.id} custom={i} variants={fadeUp} initial="hidden" animate="show"
                                                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-secondary/20 transition-colors group">
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                        <ShoppingBag className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">Order #{o.id?.slice(-6).toUpperCase()}</p>
                                                        <p className="text-[11px] text-muted-foreground font-medium">{o.customer?.name || 'Customer'} · {o.paymentMethod}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-black text-primary">₹{o.total?.toLocaleString()}</p>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                            o.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                                                            'bg-amber-50 text-amber-600'
                                                        }`}>{o.status || 'pending'}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {orders.length === 0 && (
                                                <div className="py-16 text-center">
                                                    <ShoppingBag className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                                    <p className="text-sm text-muted-foreground font-medium">No orders yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick stats sidebar */}
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Platform Health</h4>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Products live', value: products.length, max: 100 },
                                                    { label: 'Shops active', value: shops.length, max: 50 },
                                                    { label: 'Orders today', value: orders.length, max: 200 },
                                                ].map(m => (
                                                    <div key={m.label}>
                                                        <div className="flex justify-between text-[11px] font-bold mb-1">
                                                            <span className="text-muted-foreground">{m.label}</span>
                                                            <span className="text-foreground">{m.value}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }}
                                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                                className="h-full bg-primary rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-5">
                                            <Users className="w-8 h-8 text-primary/40 mb-3" />
                                            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Total Vendors</p>
                                            <p className="text-3xl font-black text-foreground">{shops.length}</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 font-medium">Registered on platform</p>
                                        </div>

                                        {pendingCount > 0 && (
                                            <button
                                                onClick={() => setActiveTab('approvals')}
                                                className="w-full bg-red-50 border border-red-100 rounded-2xl p-5 text-left hover:bg-red-100/50 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                                <p className="text-2xl font-black text-red-600">{pendingCount}</p>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">Pending Approvals</p>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── SHOPS ── */}
                        {activeTab === 'shops' && (
                            <motion.div key="shops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground tracking-tight">Manage Shops</h2>
                                        <p className="text-sm text-muted-foreground font-medium mt-0.5">{shops.length} registered vendors</p>
                                    </div>
                                    <div className="relative max-w-xs w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                        <Input
                                            placeholder="Search shops..."
                                            value={shopSearch}
                                            onChange={e => setShopSearch(e.target.value)}
                                            className="pl-9 rounded-xl h-10 bg-white border-border/60 text-sm"
                                        />
                                    </div>
                                </div>

                                <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {filteredShops.map((shop) => (
                                        <motion.div
                                            key={shop.id}
                                            variants={fadeUp}
                                            layout
                                            className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <div className="h-36 relative overflow-hidden">
                                                <img
                                                    src={shop.image}
                                                    alt={shop.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                <Badge className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary border-none font-black text-[10px]">
                                                    {shop.category}
                                                </Badge>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-base font-black text-foreground">{shop.name}</h3>
                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{shop.location}</p>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Vendor ID</p>
                                                        <p className="text-xs font-black text-primary mt-0.5 font-mono">{shop.vendorId?.slice(0, 12) || 'N/A'}</p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteShop(shop.id || (shop as any)._id)}
                                                        className="rounded-xl h-8 px-3 border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-black text-[10px] uppercase gap-1.5 transition-all"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredShops.length === 0 && (
                                        <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-dashed border-border/50">
                                            <Store className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                            <p className="text-muted-foreground font-bold">No shops found</p>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ── APPROVALS ── */}
                        {activeTab === 'approvals' && (
                            <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Product Requests</h2>
                                    <p className="text-sm text-muted-foreground font-medium mt-0.5">
                                        {pendingCount > 0 ? `${pendingCount} pending review` : 'All requests processed'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {productRequests.filter(r => r.status === 'pending').map((req) => (
                                        <motion.div
                                            key={req.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden hover:shadow-md transition-all"
                                        >
                                            <div className="p-6 flex flex-col lg:flex-row gap-6">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge className="bg-secondary text-primary border-none text-[9px] font-black tracking-widest uppercase">
                                                            Vendor: {req.vendorId?.slice(0, 8)}
                                                        </Badge>
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black tracking-widest uppercase">
                                                            {shops.find(s => s.vendorId === req.vendorId)?.name || req.shopName || 'Unknown Shop'}
                                                        </Badge>
                                                        <Badge className="bg-secondary text-muted-foreground border-none text-[9px] font-black">
                                                            <Clock className="w-2.5 h-2.5 mr-1" />
                                                            {new Date(req.requestDate).toLocaleDateString()}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-foreground tracking-tight">{req.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5">
                                                            <Badge variant="outline" className="border-border px-1.5 py-0 text-[9px]">CAT</Badge>
                                                            {req.category}
                                                        </span>
                                                        <span className="text-primary text-sm">₹{req.price}</span>
                                                        <span>Stock: {req.stock} {req.unit}</span>
                                                    </div>
                                                </div>

                                                <div className="lg:w-80 space-y-3">
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                                        Marketplace Image URL
                                                    </label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                                        <Input
                                                            placeholder="Paste image URL..."
                                                            value={selectedRequest === req.id ? adminImage : ''}
                                                            onChange={e => { setSelectedRequest(req.id); setAdminImage(e.target.value); }}
                                                            className="pl-9 bg-secondary/30 border-border rounded-xl h-11 text-sm focus-visible:ring-primary"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleApprove(req.id)}
                                                            className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-11 shadow-md shadow-primary/20 transition-all"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1.5" />
                                                            Publish
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleReject(req.id)}
                                                            className="border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl h-11 font-black transition-all px-4"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image Preview */}
                                            <AnimatePresence>
                                                {selectedRequest === req.id && adminImage && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 180, opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-border/50 bg-secondary/20 flex items-center justify-center overflow-hidden relative"
                                                    >
                                                        <img
                                                            src={adminImage}
                                                            className="h-36 object-contain rounded-xl shadow-sm bg-white"
                                                            onError={e => (e.currentTarget.style.display = 'none')}
                                                        />
                                                        <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest border border-border rounded-lg px-2 py-1">
                                                            Preview
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}

                                    {pendingCount === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-28 text-center bg-white rounded-2xl border border-dashed border-border/50 shadow-sm">
                                            <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                                                <CheckCircle className="w-8 h-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-black text-foreground mb-1">All Clear!</h3>
                                            <p className="text-sm text-muted-foreground font-medium">All vendor requests have been processed.</p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ── LOGS ── */}
                        {activeTab === 'logs' && (
                            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground tracking-tight">Activity Logs</h2>
                                        <p className="text-sm text-muted-foreground font-medium mt-0.5">Real-time audit trail · {filteredLogs.length} records</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={fetchLogs}
                                        disabled={isLoadingLogs}
                                        className="rounded-xl h-9 px-4 font-bold text-[11px] uppercase tracking-wider gap-2 self-start sm:self-auto"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                        <Input
                                            placeholder="Search logs..."
                                            value={logSearch}
                                            onChange={e => setLogSearch(e.target.value)}
                                            className="pl-9 h-10 rounded-xl bg-white border-border/60 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-white border border-border/50 rounded-xl p-1 shadow-sm">
                                        <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                                        {logTypes.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setLogFilter(t)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                                                    logFilter === t ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest px-6">Time</TableHead>
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Type</TableHead>
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Action</TableHead>
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Target</TableHead>
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Performed By</TableHead>
                                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-right px-6">Details</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoadingLogs ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-56">
                                                            <div className="flex flex-col items-center justify-center gap-3">
                                                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Fetching Logs...</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredLogs.length > 0 ? (
                                                    filteredLogs.map((log) => (
                                                        <TableRow key={log.id} className="hover:bg-secondary/10 transition-colors border-b border-border/30 last:border-0">
                                                            <TableCell className="px-6 py-3">
                                                                <p className="text-[11px] font-bold text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                                                            </TableCell>
                                                            <TableCell><LogTypeBadge type={log.type} /></TableCell>
                                                            <TableCell className="text-xs font-black uppercase text-foreground">{log.action}</TableCell>
                                                            <TableCell className="text-xs font-bold text-foreground font-mono">{log.target}</TableCell>
                                                            <TableCell className="text-xs font-bold text-muted-foreground">{log.performedBy}</TableCell>
                                                            <TableCell className="text-right px-6">
                                                                <span className="text-[10px] font-medium text-muted-foreground italic max-w-[180px] block truncate ml-auto">{log.details}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-48 text-center">
                                                            <Activity className="w-10 h-10 text-muted-foreground/10 mx-auto mb-3" />
                                                            <p className="text-sm text-muted-foreground font-medium">
                                                                {logSearch || logFilter !== 'all' ? 'No logs match your filter' : 'No activity records found'}
                                                            </p>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
