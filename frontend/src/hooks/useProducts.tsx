import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as initialProducts, Product, ProductRequest, productRequests as initialRequests } from '@/lib/data';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface ProductContextType {
    products: Product[];
    productRequests: ProductRequest[];
    addProduct: (product: Product) => void;
    requestProduct: (request: Omit<ProductRequest, 'id' | 'status' | 'requestDate'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    updateProductStock: (id: string, newStock: number) => Promise<void>;
    deleteProduct: (id: string) => void;
    updateRequestStatus: (id: string, status: 'approved' | 'rejected', adminImage?: string) => void;
    refreshProducts: () => Promise<void>;
    isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // Products might be public, but let's only fetch if we have a user to be safe
            // or if the endpoint allows public access.
            const apiProducts = await apiFetch('/products');
            if (apiProducts) setProducts(apiProducts);

            // Requests are only accessible by admin and vendor roles
            const token = localStorage.getItem('grofast-token');
            const userStr = localStorage.getItem('grofast-user');
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.role === 'admin' || user.role === 'vendor') {
                        const apiRequests = await apiFetch('/products/requests');
                        if (apiRequests) setProductRequests(apiRequests);
                    }
                } catch {}
            }
        } catch (error) {
            console.error("Failed to fetch data from API", error);
            const savedProducts = localStorage.getItem('grofast-products');
            const savedRequests = localStorage.getItem('grofast-requests');
            if (savedProducts) setProducts(savedProducts ? JSON.parse(savedProducts) : []);
            if (savedRequests) setProductRequests(savedRequests ? JSON.parse(savedRequests) : []);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load from API and local storage
    useEffect(() => {
        refreshProducts();
    }, [refreshProducts]);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('grofast-products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('grofast-requests', JSON.stringify(productRequests));
    }, [productRequests]);

    const addProduct = (product: Product) => {
        setProducts(prev => [product, ...prev]);
    };

    const requestProduct = async (req: Omit<ProductRequest, 'id' | 'status' | 'requestDate'>) => {
        try {
            const newRequest = await apiFetch('/products/request', {
                method: 'POST',
                body: JSON.stringify(req)
            });
            setProductRequests(prev => [newRequest, ...prev]);
        } catch (error) {
            console.error("Failed to submit request", error);
        }
    };

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const updateProductStock = async (id: string, newStock: number) => {
        try {
            await apiFetch(`/products/${id}/stock`, {
                method: 'PATCH',
                body: JSON.stringify({ stock: newStock })
            });
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
        } catch (error) {
            console.error("Failed to update stock", error);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Product deleted successfully");
        } catch (error) {
            console.error("Failed to delete product", error);
            toast.error("Failed to delete product");
        }
    };

    const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', adminImage?: string) => {
        try {
            const updatedRequest = await apiFetch(`/products/requests/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status, image: adminImage })
            });

            setProductRequests(prev => prev.map(r => r.id === id ? updatedRequest : r));

            if (status === 'approved') {
                // Refresh products list after approval
                const apiProducts = await apiFetch('/products');
                setProducts(apiProducts);
            }
        } catch (error) {
            console.error("Failed to update request status", error);
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            productRequests,
            addProduct,
            requestProduct,
            updateProduct,
            updateProductStock,
            deleteProduct,
            updateRequestStatus,
            refreshProducts,
            isLoading
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
