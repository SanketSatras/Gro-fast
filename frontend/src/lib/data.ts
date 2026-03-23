export interface Shop {
  id: string;
  vendorId: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  image: string;
  isOpen: boolean;
  category: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  badges: ('fresh' | 'local')[];
  stock: number;
  unit: string;
  vendorId: string; // Linked to Shop ID
  shopName?: string;
  shopLocation?: string;
  description?: string;
  isApproved: boolean; // For Admin Flow
  rating: number;
}

export interface ProductRequest {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
  shopName?: string;
  shopLocation?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    pincode: string;
  };
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  date: string;
  vendorId: string;
  userId?: string;
  blockchainHash?: string;
  deliveryBoy?: {
    name: string;
    phone: string;
    location: {
      lat: number;
      lng: number;
    }
  }
}

export const shops: Shop[] = [];

export const categories = [
  { id: 'all', label: 'All', emoji: '🛒' },
  { id: 'groceries', label: 'Groceries', emoji: '🥬' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
];

export const products: Product[] = [];

export const productRequests: ProductRequest[] = [];

export const vendorStats = {
  totalProducts: 0,
  lowStock: 0,
  inventoryValue: 0,
  ordersToday: 0,
};
