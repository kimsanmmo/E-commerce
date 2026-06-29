export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  status: 'Active' | 'Draft';
  sku: string;
  images?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  date: string;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  tags?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'Suspended';
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  taxRate: number;
  shippingFee: number;
  lowStockThreshold: number;
}
