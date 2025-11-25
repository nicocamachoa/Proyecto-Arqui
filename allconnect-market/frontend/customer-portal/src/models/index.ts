// User and Auth Models
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
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

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// Customer Models
export interface Customer {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  preferences?: Record<string, unknown>;
  createdAt: string;
}

export interface Address {
  id: number;
  customerId: number;
  label: string;
  street: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

// Product Models
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
  galleryUrls?: string[];
  attributes?: Record<string, unknown>;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  customerId: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  productType?: ProductType;
  providerType?: ProviderType;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// Cart Models
export interface CartItem {
  id: string;
  productId: number;
  product: Product;
  quantity: number;
  reservationDate?: string;
  reservationTime?: string;
}

// Order Models
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type OrderType = 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION' | 'MIXED';

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  status: OrderStatus;
  orderType: OrderType;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress?: Address;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productSku: string;
  productName: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
  price: number;
  totalPrice: number;
  providerType: ProviderType;
  providerItemId?: string;
  reservationDate?: string;
  reservationCode?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  product?: Product;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  comment?: string;
  createdBy?: string;
  createdAt: string;
}

// Payment Models
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH';

export interface Payment {
  id: number;
  paymentId: string;
  orderId: number;
  customerId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardLastFour?: string;
  cardBrand?: string;
  transactionId?: string;
  createdAt: string;
}

export interface PaymentRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolderName?: string;
}

// Checkout Models
export interface CheckoutData {
  items: CartItem[];
  shippingAddressId?: number;
  billingAddressId?: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

// Notification Models
export interface Notification {
  id: number;
  notificationId: string;
  customerId: number;
  channel: 'EMAIL' | 'SMS' | 'PUSH';
  subject?: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  createdAt: string;
  readAt?: string;
}

// Invoice Models
export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  customerId: number;
  customerName: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  issuedDate?: string;
  paidDate?: string;
  pdfUrl?: string;
}

// Recommendation Models
export interface Recommendation {
  productId: number;
  product: Product;
  score: number;
  reason: 'HISTORY' | 'SIMILAR' | 'TRENDING' | 'POPULAR';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
