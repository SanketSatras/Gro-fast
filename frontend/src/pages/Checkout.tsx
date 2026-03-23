import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MapPin, CreditCard, User, ShoppingBag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/lib/data';
import { grofastLedger } from '@/lib/blockchain';

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
});

const paymentSchema = z.object({
  method: z.enum(['cod', 'upi', 'card']),
});

type AddressForm = z.infer<typeof addressSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

const steps = [
  { label: 'Address', icon: MapPin },
  { label: 'Payment', icon: CreditCard },
  { label: 'Confirm', icon: Check },
];

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { updateProduct } = useProducts();
  const { placeOrder } = useOrders();
  const [step, setStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [showSummary, setShowSummary] = useState(false);
  const navigate = useNavigate();

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: user?.name || '', phone: '', address: '', pincode: '' },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/customer');
    } else if (user) {
      // Check for blockchain-verified identity
      const verifiedIdentity = grofastLedger.getUserIdentity(user.id);
      
      if (verifiedIdentity) {
        addressForm.reset({
          name: verifiedIdentity.name,
          phone: verifiedIdentity.phone,
          address: verifiedIdentity.address,
          pincode: verifiedIdentity.pincode
        });
      } else {
        // Fallback to basic profile name
        addressForm.reset({
          ...addressForm.getValues(),
          name: user.name
        });
      }
    }
  }, [isAuthenticated, user, navigate, addressForm]);

  const handleNext = async () => {
    if (step === 0) {
      addressForm.handleSubmit(() => setStep(1))();
    } else if (step === 1) {
      setStep(2);
    } else {
      // Place actual order
      const newOrder: Order = {
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        items: items,
        total: subtotal,
        customer: {
          name: addressForm.getValues('name') || user?.name || 'Customer',
          phone: addressForm.getValues('phone') || '',
          address: addressForm.getValues('address') || '',
          pincode: addressForm.getValues('pincode') || '',
        },
        paymentMethod: paymentMethod,
        status: 'pending',
        date: new Date().toISOString(),
        vendorId: items.length > 0 ? items[0].vendorId : 'unknown',
        userId: user?.id
      };

      // Update Stock
      items.forEach(item => {
        updateProduct(item.id, { stock: Math.max(0, item.stock - item.quantity) });
      });

      const result = await placeOrder(newOrder);
      setPlacedOrderId(result.id);
      setOrderPlaced(true);
      clearCart();
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-24 h-24 rounded-full bg-[#0f9d58] mx-auto flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20"
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed! 🎉</h1>
          <p className="text-muted-foreground mb-6">Your order will be delivered in 30 minutes</p>
          <Button
            onClick={() => navigate(`/order-tracking/${placedOrderId}`)}
            className="gradient-emerald text-primary-foreground hover:opacity-90 rounded-xl shadow-emerald"
          >
            Track Your Order
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Checkout</h1>
        </div>
      </div>

      {/* Step indicators */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i <= step ? 'gradient-emerald text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {grofastLedger.getUserIdentity(user?.id || '') && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl mb-2"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={4} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Blockchain Verified Identity Found</span>
                </motion.div>
              )}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...addressForm.register('name')} placeholder="John Doe" className="mt-1.5 rounded-xl h-11" />
                {addressForm.formState.errors.name && <p className="text-xs text-destructive mt-1">{addressForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...addressForm.register('phone')} placeholder="+91 9876543210" className="mt-1.5 rounded-xl h-11" />
                {addressForm.formState.errors.phone && <p className="text-xs text-destructive mt-1">{addressForm.formState.errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Input id="address" {...addressForm.register('address')} placeholder="House no, Street, Area" className="mt-1.5 rounded-xl h-11" />
                {addressForm.formState.errors.address && <p className="text-xs text-destructive mt-1">{addressForm.formState.errors.address.message}</p>}
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" {...addressForm.register('pincode')} placeholder="110001" className="mt-1.5 rounded-xl h-11" />
                {addressForm.formState.errors.pincode && <p className="text-xs text-destructive mt-1">{addressForm.formState.errors.pincode.message}</p>}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                { id: 'upi', label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm' },
                { id: 'card', label: 'Card Payment', desc: 'Credit/Debit card' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${paymentMethod === opt.id ? 'border-primary bg-primary/5 shadow-emerald' : 'border-border hover:border-primary/30'
                    }`}
                >
                  <p className="font-medium text-foreground">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-2">Delivery Address</h3>
                <p className="text-sm text-muted-foreground">{addressForm.getValues('name')}</p>
                <p className="text-sm text-muted-foreground">{addressForm.getValues('address')}, {addressForm.getValues('pincode')}</p>
                <p className="text-sm text-muted-foreground">{addressForm.getValues('phone')}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl">
                <h3 className="font-semibold text-foreground mb-2">Payment</h3>
                <p className="text-sm text-muted-foreground capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</p>
              </div>

              {/* Order Summary Dropdown (User Preferred Accordion Structure) */}
              <div className="glass-card overflow-hidden rounded-2xl">
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-foreground">Order Summary</h3>
                  </div>
                  <motion.div animate={{ rotate: showSummary ? 180 : 0 }}>
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showSummary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50"
                    >
                      <div className="p-4 space-y-3">
                        {items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-border flex justify-between items-center font-bold">
                          <span>Total Amount</span>
                          <span className="text-emerald-600 text-lg">₹{subtotal}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.98 }} className="mt-8">
          <Button
            onClick={handleNext}
            className="w-full bg-[#0f9d58] hover:bg-[#0b8043] text-white rounded-2xl h-14 text-base font-bold shadow-xl shadow-emerald-500/10 transition-all border-none"
          >
            {step === 2 ? 'Place Order Now' : 'Continue to next step'}
            {step < 2 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
