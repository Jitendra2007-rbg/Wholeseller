import { User, Product, Order, UserRole, OrderStatus } from '../types.ts';

// Initial Seed Data
const SEED_PRODUCTS: Product[] = [
  { _id: 'p1', name: 'Basmati Rice (Premium)', sku: 'RICE-001', category: 'Grains', description: 'Aged premium basmati rice.', price: 85, unit: 'kg', stock: 500, imageUrl: 'https://picsum.photos/200/200?random=1' },
  { _id: 'p2', name: 'Sunflower Oil', sku: 'OIL-002', category: 'Oil', description: 'Refined sunflower oil for cooking.', price: 140, unit: 'liter', stock: 200, imageUrl: 'https://picsum.photos/200/200?random=2' },
  { _id: 'p3', name: 'Wheat Flour (Atta)', sku: 'FLR-003', category: 'Grains', description: 'Whole wheat flour.', price: 40, unit: 'kg', stock: 1000, imageUrl: 'https://picsum.photos/200/200?random=3' },
  { _id: 'p4', name: 'Sugar (Crystal)', sku: 'SUG-004', category: 'Essentials', description: 'White crystal sugar.', price: 42, unit: 'kg', stock: 600, imageUrl: 'https://picsum.photos/200/200?random=4' },
  { _id: 'p5', name: 'Toor Dal', sku: 'DAL-005', category: 'Pulses', description: 'High quality polished Toor Dal.', price: 110, unit: 'kg', stock: 300, imageUrl: 'https://picsum.photos/200/200?random=5' },
];

const SEED_ADMIN: User = {
  _id: 'u1',
  ownerName: 'System Admin',
  email: 'admin@wholesale.com',
  passwordHash: 'password',
  role: UserRole.ADMIN,
};

const SEED_CUSTOMER: User = {
  _id: 'u2',
  shopName: 'City Supermarket',
  ownerName: 'John Doe',
  email: 'shop@local.com',
  phone: '9876543210',
  address: '123 Market St, Downtown',
  passwordHash: 'password',
  role: UserRole.CUSTOMER,
};

// DB Helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize DB
export const initDB = () => {
  if (!localStorage.getItem('users')) {
    saveToStorage('users', [SEED_ADMIN, SEED_CUSTOMER]);
  }
  if (!localStorage.getItem('products')) {
    saveToStorage('products', SEED_PRODUCTS);
  }
  if (!localStorage.getItem('orders')) {
    saveToStorage('orders', []);
  }
};

// API Methods
export const mockApi = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(500);
    const users = getFromStorage<User[]>('users', []);
    const user = users.find(u => u.email === email && u.passwordHash === password);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  register: async (userData: Omit<User, '_id' | 'role'>): Promise<User> => {
    await delay(500);
    const users = getFromStorage<User[]>('users', []);
    if (users.find(u => u.email === userData.email)) throw new Error('Email already exists');
    
    const newUser: User = {
      ...userData,
      _id: Math.random().toString(36).substr(2, 9),
      role: UserRole.CUSTOMER,
    };
    users.push(newUser);
    saveToStorage('users', users);
    return newUser;
  },

  getProducts: async (): Promise<Product[]> => {
    await delay(300);
    return getFromStorage<Product[]>('products', []);
  },

  saveProduct: async (product: Product): Promise<Product> => {
    await delay(300);
    const products = getFromStorage<Product[]>('products', []);
    const index = products.findIndex(p => p._id === product._id);
    
    if (index >= 0) {
      products[index] = product;
    } else {
      product._id = Math.random().toString(36).substr(2, 9);
      products.push(product);
    }
    saveToStorage('products', products);
    return product;
  },

  deleteProduct: async (id: string): Promise<void> => {
     await delay(300);
     const products = getFromStorage<Product[]>('products', []);
     const newProducts = products.filter(p => p._id !== id);
     saveToStorage('products', newProducts);
  },

  createOrder: async (userId: string, items: any[], total: number): Promise<Order> => {
    await delay(600);
    const users = getFromStorage<User[]>('users', []);
    const user = users.find(u => u._id === userId);
    if (!user) throw new Error('User not found');

    // Decrement stock
    const products = getFromStorage<Product[]>('products', []);
    items.forEach(item => {
        const pIndex = products.findIndex(p => p._id === item.productId);
        if(pIndex >= 0) {
            products[pIndex].stock = Math.max(0, products[pIndex].stock - item.quantity);
        }
    });
    saveToStorage('products', products);

    const newOrder: Order = {
      _id: Math.random().toString(36).substr(2, 9),
      customerId: userId,
      customerName: user.shopName || user.ownerName,
      items: items.map(i => ({
        productId: i._id,
        name: i.name,
        unitPrice: i.price,
        quantity: i.quantity,
        lineTotal: i.price * i.quantity
      })),
      totalAmount: total,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    };

    const orders = getFromStorage<Order[]>('orders', []);
    orders.unshift(newOrder);
    saveToStorage('orders', orders);
    return newOrder;
  },

  getOrders: async (userId?: string): Promise<Order[]> => {
    await delay(300);
    const orders = getFromStorage<Order[]>('orders', []);
    if (userId) {
      return orders.filter(o => o.customerId === userId);
    }
    return orders;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    await delay(300);
    const orders = getFromStorage<Order[]>('orders', []);
    const orderIndex = orders.findIndex(o => o._id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');
    
    orders[orderIndex].status = status;
    saveToStorage('orders', orders);
    return orders[orderIndex];
  },

  getAllUsers: async (): Promise<User[]> => {
      await delay(300);
      return getFromStorage<User[]>('users', []).filter(u => u.role === UserRole.CUSTOMER);
  },

  // Helper for dev role switching
  getDevUser: async (role: UserRole): Promise<User> => {
    await delay(200);
    if (role === UserRole.ADMIN) return SEED_ADMIN;
    return SEED_CUSTOMER;
  }
};