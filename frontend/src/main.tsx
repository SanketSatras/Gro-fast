import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { ProductProvider } from "./hooks/useProducts";
import { OrderProvider } from "./hooks/useOrders";
import { ShopProvider } from "./hooks/useShops";

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <ProductProvider>
            <OrderProvider>
                <ShopProvider>
                    <App />
                </ShopProvider>
            </OrderProvider>
        </ProductProvider>
    </AuthProvider>
);

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
