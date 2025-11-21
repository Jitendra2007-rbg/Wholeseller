export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  _id: string;
  shopName?: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  passwordHash: string; // In real app, hashed. Here plain for mock.
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  unit: string; // e.g., 'kg', 'box', 'liters'
  stock: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  customerId: string;
  customerName: string; // Denormalized for display ease
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  invoiceNumber: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}