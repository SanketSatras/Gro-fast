import { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '@/lib/data';
import { apiFetch } from '@/lib/api';
import { useAuth } from './useAuth';
import { grofastLedger } from '@/lib/blockchain';

interface OrderContextType {
    orders: Order[];
    placeOrder: (order: Order) => Promise<Order>;
    updateOrderStatus: (id: string, status: Order['status']) => void;
    getOrderById: (id: string) => Promise<Order | null>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                let params = '';
                if (user) {
                    if (user.role === 'delivery') {
                        params = `?role=delivery`;
                    } else {
                        params = `?role=${user.role}&userId=${user.id}&vendorId=${user.id}&name=${encodeURIComponent(user.name)}`;
                    }
                }
                const apiOrders = await apiFetch(`/orders${params}`);
                setOrders(apiOrders);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                const saved = localStorage.getItem('grofast-orders');
                if (saved) setOrders(JSON.parse(saved));
            }
        };
        fetchOrders();
        
        // Auto-refresh orders every 10 seconds to sync Deliveries across Vendor and Customer apps
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const placeOrder = async (order: Order): Promise<Order> => {
        try {
            // Record on the mock blockchain
            const txHash = grofastLedger.recordOrder(order);
            const orderWithHash = { ...order, blockchainHash: txHash };

            const savedOrder = await apiFetch('/orders', {
                method: 'POST',
                body: JSON.stringify(orderWithHash)
            });
            setOrders(prev => [savedOrder, ...prev]);
            return savedOrder;
        } catch (error) {
            console.error("Failed to place order via API", error);
            // Record locally if API fails
            const txHash = grofastLedger.recordOrder(order);
            const orderWithHash = { ...order, blockchainHash: txHash };
            setOrders(prev => [orderWithHash, ...prev]);
            return orderWithHash;
        }
    };

    const updateOrderStatus = async (id: string, status: Order['status']) => {
        try {
            await apiFetch(`/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (error) {
            console.error("Failed to update status via API", error);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        }
    };

    const getOrderById = async (id: string): Promise<Order | null> => {
        try {
            return await apiFetch(`/orders/${id}`);
        } catch (error) {
            console.error("Failed to fetch order", error);
            return orders.find(o => o.id === id) || null;
        }
    };

    return (
        <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrderById }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
