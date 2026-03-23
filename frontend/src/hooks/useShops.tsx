import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Shop } from '@/lib/data';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface ShopContextType {
    shops: Shop[];
    isLoading: boolean;
    deleteShop: (id: string) => Promise<void>;
    refreshShops: (silent?: boolean) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshShops = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await apiFetch('/shops');
            setShops(data);
        } catch (error) {
            console.error("Failed to fetch shops", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshShops();
    }, []);

    const deleteShop = async (id: string) => {
        try {
            console.log(`[ShopProvider] Attempting to delete shop with ID: ${id}`);
            await apiFetch(`/shops/${id}`, { method: 'DELETE' });
            console.log(`[ShopProvider] Deletion successful for ID: ${id}. Updating local state.`);
            setShops(prev => {
                const filtered = prev.filter(s => s.id !== id && (s as any)._id !== id);
                console.log(`[ShopProvider] Shops before: ${prev.length}, after: ${filtered.length}`);
                return filtered;
            });
            toast.success("Shop and associated products removed");
        } catch (error) {
            console.error("[ShopProvider] Failed to delete shop:", error);
            toast.error("Failed to delete shop");
            throw error;
        }
    };

    return (
        <ShopContext.Provider value={{ shops, isLoading, deleteShop, refreshShops }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShops = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShops must be used within a ShopProvider');
    }
    return context;
};
