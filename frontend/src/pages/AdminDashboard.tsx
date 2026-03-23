import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, LineChart, ShieldCheck, Activity, ShoppingBag, ArrowLeft, CheckCircle, XCircle, Image as ImageIcon, ExternalLink, Search } from 'lucide-react';
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

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { products, productRequests, updateRequestStatus } = useProducts();
    const { orders } = useOrders();
    const { shops, deleteShop } = useShops();

    const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'shops' | 'logs'>('overview');
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [adminImage, setAdminImage] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchLogs = async () => {
        try {
            setIsLoadingLogs(true);
            const data = await apiFetch('/admin/logs');
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to load system logs');
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalVendors = shops.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pendingApprovals = productRequests.filter(r => r.status === 'pending').length;

        return [
            { label: 'Live Products', value: totalProducts, icon: ShoppingBag, color: 'text-primary' },
            { label: 'Active Shops', value: totalVendors, icon: Store, color: 'text-amber-500' },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: LineChart, color: 'text-emerald-600' },
            { label: 'Pending Approvals', value: pendingApprovals, icon: Activity, color: 'text-destructive' },
        ];
    }, [products, orders, productRequests, shops]);

    const handleApprove = (id: string) => {
        if (!adminImage) {
            toast.error("Please provide a product image URL first.");
            return;
        }
        updateRequestStatus(id, 'approved', adminImage);
        toast.success("Product approved and added to marketplace!");
        setSelectedRequest(null);
        setAdminImage('');
    };

    const handleReject = (id: string) => {
        updateRequestStatus(id, 'rejected');
        toast.info("Request rejected.");
        setSelectedRequest(null);
    };

    const handleDeleteShop = async (shopId: string) => {
        try {
            console.log(`[AdminDashboard] handleDeleteShop called for shopId: ${shopId}`);
            if (confirm("Are you sure? This will delete the shop and all its products.")) {
                await deleteShop(shopId);
            }
        } catch (error) {
            console.error("[AdminDashboard] Error deleting shop:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Command Header */}
            <header className="sticky top-0 z-50 glass border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-secondary rounded-xl transition-all">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                                <img src="/icon-512.png" alt="Grofast Logo" className="w-7 h-7 object-contain" />
                                <span className="text-foreground">GRO</span>
                                <span className="text-primary">FAST</span>
                                <span className="text-muted-foreground/30 font-light mx-1">|</span>
                                <span className="text-sm font-bold tracking-widest uppercase">Admin</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-foreground">{user?.name}</p>
                            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary px-2 py-0 uppercase font-black">System Admin</Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={logout} className="rounded-xl h-9 border-border hover:bg-destructive/10 hover:text-destructive font-bold uppercase text-[10px] tracking-widest transition-all">
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-10">
                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card group hover:shadow-lift transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl bg-secondary border border-border/50 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <Activity className="w-4 h-4 text-muted-foreground/20" />
                            </div>
                            <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main Management Tabs */}
                <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl border border-border/50 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-8 h-11 rounded-xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'gradient-emerald text-white shadow-emerald' : 'bg-transparent text-muted-foreground hover:bg-secondary'}`}
                    >
                        DASHBOARD
                    </button>
                    <button
                        onClick={() => setActiveTab('shops')}
                        className={`flex items-center gap-2 px-8 h-11 rounded-xl font-bold text-sm transition-all ${activeTab === 'shops' ? 'gradient-emerald text-white shadow-emerald' : 'bg-transparent text-muted-foreground hover:bg-secondary'}`}
                    >
                        SHOPS
                    </button>
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`flex items-center gap-2 px-8 h-11 rounded-xl font-bold text-sm transition-all ${activeTab === 'approvals' ? 'gradient-emerald text-white shadow-emerald' : 'bg-transparent text-muted-foreground hover:bg-secondary'}`}
                    >
                        REQUESTS
                        {productRequests.filter(r => r.status === 'pending').length > 0 && (
                            <span className="bg-destructive text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm">
                                {productRequests.filter(r => r.status === 'pending').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex items-center gap-2 px-8 h-11 rounded-xl font-bold text-sm transition-all ${activeTab === 'logs' ? 'gradient-emerald text-white shadow-emerald' : 'bg-transparent text-muted-foreground hover:bg-secondary'}`}
                    >
                        LOGS
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white border border-border/50 rounded-[2rem] p-8 shadow-sm">
                                <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-muted-foreground">Recent Activity</h3>
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map(o => (
                                        <div key={o.id} className="flex items-center justify-between p-4 bg-secondary/30 border border-transparent rounded-2xl group hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-border shadow-sm">
                                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">Order #{o.id}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{o.customer?.name || 'Customer'} · {o.paymentMethod}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-primary">₹{o.total}</p>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <p className="text-center py-10 text-muted-foreground font-medium">No recent orders found.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2rem] relative overflow-hidden shadow-sm">
                                <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/10" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Security Status</h4>
                                <p className="text-3xl font-black text-foreground uppercase tracking-tight">Protected</p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">System encrypted and verified.</p>
                            </div>

                            <div className="bg-white border border-border/50 p-8 rounded-[2rem] shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Database Connection</h4>
                                <p className="text-3xl font-black text-emerald-500 uppercase tracking-tight">Online</p>
                                <p className="text-xs text-muted-foreground mt-2 font-medium">MongoDB Cluster connected successfully.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shops' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map((shop) => (
                            <motion.div
                                key={shop.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-border/50 rounded-[2.5rem] p-6 shadow-sm group hover:shadow-md transition-all"
                            >
                                <div className="h-40 rounded-2xl overflow-hidden mb-6 relative">
                                    <img src={shop.image} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-white/90 backdrop-blur-md text-primary border-none font-black text-[10px]">
                                            {shop.category}
                                        </Badge>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-1">{shop.name}</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">{shop.location}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Vendor ID</p>
                                        <p className="text-sm font-black text-primary">{shop.vendorId || 'N/A'}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const idToDelete = shop.id || (shop as any)._id;
                                            console.log(`[AdminDashboard] Remove clicked for shop: ${shop.name}, ID to delete: ${idToDelete}`);
                                            handleDeleteShop(idToDelete);
                                        }}
                                        className="rounded-xl border-border hover:bg-destructive/10 hover:text-destructive h-10 font-black text-[11px] uppercase tracking-wider transition-all"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="space-y-6">
                        {productRequests.filter(r => r.status === 'pending').map((req) => (
                            <motion.div key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="p-8 flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className="bg-secondary text-primary border-none uppercase text-[9px] font-black tracking-widest">Vendor ID: {req.vendorId}</Badge>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none uppercase text-[9px] font-black tracking-widest">
                                                Shop: {shops.find(s => s.vendorId === req.vendorId)?.name || req.shopName || 'Unknown Shop'}
                                            </Badge>
                                            <Badge className="bg-secondary text-muted-foreground border-none uppercase text-[9px] font-black">{new Date(req.requestDate).toLocaleDateString()}</Badge>
                                        </div>
                                        <h3 className="text-3xl font-black text-foreground mb-2 tracking-tight">{req.name}</h3>
                                        <div className="flex items-center gap-6 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Badge variant="outline" className="border-border px-1.5 py-0">CAT</Badge> {req.category}</span>
                                            <span className="text-primary">₹{req.price}</span>
                                            <span>STOCK: {req.stock} {req.unit}</span>
                                        </div>
                                    </div>

                                    <div className="lg:w-96 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Marketplace Product Image</label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                <Input
                                                    placeholder="Paste image URL here..."
                                                    value={selectedRequest === req.id ? adminImage : ""}
                                                    onChange={(e) => {
                                                        setSelectedRequest(req.id);
                                                        setAdminImage(e.target.value);
                                                    }}
                                                    className="bg-secondary/30 border-border rounded-xl h-12 pl-12 text-sm focus-visible:ring-primary shadow-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button onClick={() => handleApprove(req.id)} className="flex-1 gradient-emerald text-white font-black rounded-xl h-12 shadow-emerald">
                                                PUBLISH
                                            </Button>
                                            <Button variant="outline" onClick={() => handleReject(req.id)} className="border-border hover:bg-destructive/10 hover:text-destructive rounded-xl h-12 font-black transition-all">
                                                REJECT
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {selectedRequest === req.id && adminImage && (
                                    <div className="bg-secondary/20 p-6 border-t border-border/50 flex items-center justify-center h-56 relative group">
                                        <img src={adminImage} className="h-full object-contain rounded-2xl shadow-lift bg-white" onError={(e) => (e.currentTarget.src = "")} />
                                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-lg text-[9px] font-black uppercase tracking-widest border border-border shadow-sm">Preview Mode</div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {productRequests.filter(r => r.status === 'pending').length === 0 && (
                            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-border/50 shadow-sm">
                                <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2">QUEUE CLEARED</h3>
                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">All vendor requests have been processed.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white border border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground">System Activity Logs</h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Real-time audit trail of administrative actions</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoadingLogs} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6">
                                Refresh
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-secondary/20">
                                    <TableRow>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest px-8">Time</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Type</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Action</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Target/ID</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Performed By</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-right px-8">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingLogs ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fetching Logs...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length > 0 ? logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-secondary/10 transition-colors border-b border-border/30 last:border-0">
                                            <TableCell className="px-8 text-[11px] font-bold text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`rounded-lg font-black text-[9px] uppercase tracking-tighter px-2 border-none ${
                                                    log.type === 'shop' ? 'bg-amber-50 text-amber-600' :
                                                    log.type === 'product' ? 'bg-blue-50 text-blue-600' :
                                                    log.type === 'order' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                                                }`}>
                                                    {log.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-black uppercase text-foreground">{log.action}</TableCell>
                                            <TableCell className="text-xs font-bold text-foreground">{log.target}</TableCell>
                                            <TableCell className="text-xs font-bold text-muted-foreground">{log.performedBy}</TableCell>
                                            <TableCell className="text-right px-8 text-[10px] font-medium text-muted-foreground italic max-w-xs truncate">{log.details}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64 text-center">
                                                <Activity className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No activity records found</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
