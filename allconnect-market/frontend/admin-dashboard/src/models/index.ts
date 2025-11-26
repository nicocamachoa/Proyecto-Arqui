// User and Auth
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'CUSTOMER' | 'ADMIN_NEGOCIO' | 'ADMIN_CONTENIDO' | 'ADMIN_IT' | 'ADMIN_OPERACIONES';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// Dashboard Stats
export interface TopProduct {
  id?: number;
  productId?: number;
  productName: string;
  sku: string;
  price: number;
  sales: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  salesByDay: { date: string; revenue: number; orders: number }[];
  salesByCategory?: { category: string; revenue: number }[];
  topProducts: TopProduct[];
}

// Product
export type ProductType = 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';
export type ProviderType = 'REST' | 'SOAP' | 'GRPC';

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  productType: ProductType;
  categoryId?: number;
  category?: Category;
  providerType: ProviderType;
  providerProductId?: string;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
}

// Order
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  orderType: 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION' | 'MIXED';
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Customer
export interface Customer {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt?: string;
}

// System Health (IT Admin)
export interface ServiceHealth {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime: number;
  lastCheck: string;
  details?: Record<string, unknown>;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  service: string;
  eventType: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
  metadata?: Record<string, unknown>;
}

// Integration Status (IT Admin)
export interface IntegrationStatus {
  name: string;
  type: ProviderType;
  endpoint: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync: string;
  successRate: number;
  avgResponseTime: number;
}

// Content Management
export interface ContentItem {
  id: string;
  type: 'BANNER' | 'PROMOTION' | 'PAGE';
  title: string;
  content?: string;
  imageUrl?: string;
  targetUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  position?: number;
  createdAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
