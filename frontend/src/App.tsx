import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy Loaded Routes
const Index = lazy(() => import("./pages/Index"));
const Checkout = lazy(() => import("./pages/Checkout"));
const LocationSelection = lazy(() => import("./pages/LocationSelection"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DeliveryDashboard = lazy(() => import("./pages/DeliveryDashboard"));
const DeliveryAuth = lazy(() => import("./pages/auth/DeliveryAuth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const GlobalCategory = lazy(() => import("./pages/GlobalCategory"));
const ProductVendors = lazy(() => import("./pages/ProductVendors"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const CustomerAuth = lazy(() => import("./pages/auth/CustomerAuth"));
const VendorAuth = lazy(() => import("./pages/auth/VendorAuth"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          }
        >
          <Routes>
          {/* Main User Flow */}
          <Route path="/" element={<LocationSelection />} />
          <Route path="/category/:categoryId" element={<GlobalCategory />} />
          <Route path="/product/:productName" element={<ProductVendors />} />
          <Route path="/shop/:shopId" element={<Index />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin", "vendor", "delivery"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/auth/customer" element={<CustomerAuth />} />
          <Route path="/auth/vendor" element={<VendorAuth />} />
          <Route path="/auth/delivery" element={<DeliveryAuth />} />

          {/* Protected Routes */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect old dashboard path if needed, or just Not Found */}
          <Route path="/marketplace" element={<Navigate to="/" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
