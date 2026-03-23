import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Navigation,
  ExternalLink,
  MessageSquare,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/lib/data';
import { Loader2 } from 'lucide-react';

const steps = [
  { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2, desc: 'Shop has accepted your order' },
  { status: 'preparing', label: 'Preparing', icon: Package, desc: 'Your order is being packed' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, desc: 'Delivery partner is on the way' },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Order received successfully' },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const data = await getOrderById(orderId);
        setOrder(data);
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
        <p className="text-slate-500 mb-6">We couldn't find the order details you're looking for.</p>
        <Button onClick={() => navigate('/')} className="gradient-emerald text-white rounded-xl">
          Back to Home
        </Button>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900">Track Order</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">ID: {order.id}</p>
            </div>
          </div>
          {order.status === 'out_for_delivery' && (
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Live
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          {isCancelled ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 rotate-45" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Order Cancelled</h2>
              <p className="text-slate-500 text-sm mt-1">This order was cancelled. Please contact support for help.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex gap-4 relative">
                    {/* Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute left-5 top-10 w-0.5 h-12 ${
                        index < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-100'
                      }`} />
                    )}
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${
                      isCompleted ? 'bg-emerald-500 text-white' : 
                      isCurrent ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500' : 
                      'bg-slate-50 text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 pt-1">
                      <h3 className={`font-bold text-sm ${isCurrent ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {step.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>

                    {isCurrent && (
                      <motion.div 
                        layoutId="active-dot"
                        className="w-2 h-2 bg-emerald-500 rounded-full mt-2" 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Map Placeholder/Visualizer */}
        {order.status === 'out_for_delivery' && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 aspect-video relative group">
            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Live Map View</p>
                    <p className="text-xs text-slate-400">Delivery partner mapping is active</p>
                </div>
            </div>
            
            {/* Mock Markers */}
            <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-500">
                <MapPin className="w-6 h-6 text-emerald-500" />
                <div className="absolute -top-1 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full uppercase">You</div>
            </div>

            <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500 animate-pulse">
                <Truck className="w-6 h-6 text-blue-500" />
                <div className="absolute -top-1 px-2 py-0.5 bg-blue-500 text-white text-[8px] font-bold rounded-full uppercase">Rider</div>
            </div>
            
            <Button 
                variant="outline" 
                size="sm"
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl border-slate-200"
                onClick={() => {
                    const query = encodeURIComponent(`${order.customer.address}, ${order.customer.pincode}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                }}
            >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full View
            </Button>
          </div>
        )}

        {/* Delivery Partner Details */}
        {order.deliveryBoy && (
           <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Delivery Partner</p>
                   <h3 className="text-lg font-bold text-slate-900">{order.deliveryBoy.name}</h3>
                   <div className="flex items-center gap-1 mt-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase">Verified Partner</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${order.deliveryBoy.phone}`} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <Phone className="w-5 h-5 text-slate-700" />
                </a>
                <button className="p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                </button>
              </div>
           </div>
        )}

        {/* Order Details Accordion */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Order Items</h3>
                <span className="text-xs font-bold text-slate-400">{order.items.length} Items</span>
            </div>
            <div className="p-5 space-y-4">
                {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 p-1">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</span>
                    </div>
                ))}
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Paid</span>
                    <span className="text-lg font-black text-emerald-600">₹{order.total}</span>
                </div>
            </div>
        </div>

        {/* Back Home */}
        <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="w-full h-14 rounded-2xl text-slate-500 font-bold hover:bg-slate-100"
        >
            Return to Home
        </Button>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 md:hidden z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arriving in</p>
                  <p className="text-lg font-black text-slate-900">25-30 Mins</p>
              </div>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-emerald-500/20">
                  Contact Support
              </Button>
          </div>
      </div>
    </div>
  );
}
