import { User, Product, Order, Customer, DashboardStats, ServiceHealth, SystemMetrics, EventLog, IntegrationStatus, ContentItem } from '../models';

// Admin Users
export const mockUsers: User[] = [
  {
    id: 3,
    email: 'admin.negocio@test.com',
    firstName: 'Carlos',
    lastName: 'Negocio',
    role: 'ADMIN_NEGOCIO',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    email: 'admin.contenido@test.com',
    firstName: 'Ana',
    lastName: 'Contenido',
    role: 'ADMIN_CONTENIDO',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    email: 'admin.it@test.com',
    firstName: 'Pedro',
    lastName: 'TI',
    role: 'ADMIN_IT',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 6,
    email: 'admin.operaciones@test.com',
    firstName: 'Laura',
    lastName: 'Operaciones',
    role: 'ADMIN_OPERACIONES',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Products
export const mockProducts: Product[] = [
  {
    id: 1,
    sku: 'ELEC-LAPTOP-001',
    name: 'Laptop Gaming XPS 15',
    description: 'Laptop de alta gama para gaming con procesador Intel Core i9 y tarjeta gráfica RTX 4080',
    price: 1299.99,
    productType: 'PHYSICAL',
    categoryId: 1,
    providerType: 'REST',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    stock: 50,
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.8,
    ratingCount: 127,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    sku: 'ELEC-PHONE-001',
    name: 'Smartphone Galaxy S24 Ultra',
    description: 'El smartphone más avanzado con cámara de 200MP y S Pen integrado',
    price: 899.99,
    productType: 'PHYSICAL',
    categoryId: 1,
    providerType: 'REST',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    stock: 5, // Low stock
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.7,
    ratingCount: 89,
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 7,
    sku: 'SERV-MEDIC-001',
    name: 'Consulta Médica General',
    description: 'Consulta médica virtual con profesionales certificados',
    price: 45.00,
    productType: 'SERVICE',
    categoryId: 3,
    providerType: 'SOAP',
    imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800',
    stock: 100,
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.9,
    ratingCount: 234,
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: 13,
    sku: 'SUBS-STREAM-001',
    name: 'StreamFlix Premium',
    description: 'Streaming ilimitado de películas y series en 4K HDR',
    price: 14.99,
    productType: 'SUBSCRIPTION',
    categoryId: 5,
    providerType: 'GRPC',
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800',
    stock: 1000,
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.6,
    ratingCount: 1523,
    createdAt: '2024-01-04T00:00:00Z'
  }
];

// Orders
export const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customerId: 1,
    customerName: 'Juan Cliente',
    customerEmail: 'cliente@test.com',
    status: 'DELIVERED',
    orderType: 'PHYSICAL',
    subtotal: 1299.99,
    tax: 169.00,
    shippingCost: 0,
    discount: 0,
    total: 1468.99,
    items: [
      { id: 1, productId: 1, productName: 'Laptop Gaming XPS 15', productType: 'PHYSICAL', quantity: 1, unitPrice: 1299.99, totalPrice: 1299.99 }
    ],
    createdAt: '2024-11-20T10:30:00Z',
    updatedAt: '2024-11-22T15:00:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customerId: 2,
    customerName: 'Maria Compradora',
    customerEmail: 'cliente2@test.com',
    status: 'PENDING',
    orderType: 'SERVICE',
    subtotal: 45.00,
    tax: 5.85,
    shippingCost: 0,
    discount: 0,
    total: 50.85,
    items: [
      { id: 2, productId: 7, productName: 'Consulta Médica General', productType: 'SERVICE', quantity: 1, unitPrice: 45.00, totalPrice: 45.00 }
    ],
    createdAt: '2024-11-24T08:00:00Z',
    updatedAt: '2024-11-24T08:00:00Z'
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-003',
    customerId: 1,
    customerName: 'Juan Cliente',
    customerEmail: 'cliente@test.com',
    status: 'CONFIRMED',
    orderType: 'SUBSCRIPTION',
    subtotal: 14.99,
    tax: 1.95,
    shippingCost: 0,
    discount: 0,
    total: 16.94,
    items: [
      { id: 3, productId: 13, productName: 'StreamFlix Premium', productType: 'SUBSCRIPTION', quantity: 1, unitPrice: 14.99, totalPrice: 14.99 }
    ],
    createdAt: '2024-11-23T14:20:00Z',
    updatedAt: '2024-11-23T14:30:00Z'
  }
];

// Customers
export const mockCustomers: Customer[] = [
  {
    id: 1,
    userId: 1,
    email: 'cliente@test.com',
    firstName: 'Juan',
    lastName: 'Cliente',
    phone: '+506 8888-1111',
    ordersCount: 5,
    totalSpent: 2534.50,
    createdAt: '2024-01-01T00:00:00Z',
    lastOrderAt: '2024-11-23T14:20:00Z'
  },
  {
    id: 2,
    userId: 2,
    email: 'cliente2@test.com',
    firstName: 'Maria',
    lastName: 'Compradora',
    phone: '+506 8888-2222',
    ordersCount: 2,
    totalSpent: 345.00,
    createdAt: '2024-01-05T00:00:00Z',
    lastOrderAt: '2024-11-24T08:00:00Z'
  }
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalOrders: 156,
  totalRevenue: 45678.90,
  totalCustomers: 89,
  totalProducts: 18,
  pendingOrders: 12,
  lowStockProducts: 3,
  recentOrders: mockOrders,
  salesByDay: [
    { date: '2024-11-18', revenue: 2345.00, orders: 8 },
    { date: '2024-11-19', revenue: 3456.00, orders: 12 },
    { date: '2024-11-20', revenue: 4567.00, orders: 15 },
    { date: '2024-11-21', revenue: 3234.00, orders: 11 },
    { date: '2024-11-22', revenue: 5678.00, orders: 18 },
    { date: '2024-11-23', revenue: 4321.00, orders: 14 },
    { date: '2024-11-24', revenue: 2890.00, orders: 9 }
  ],
  salesByCategory: [
    { category: 'Electrónica', revenue: 18500 },
    { category: 'Servicios', revenue: 8900 },
    { category: 'Suscripciones', revenue: 12300 },
    { category: 'Ropa', revenue: 5978 }
  ],
  topProducts: [
    { product: mockProducts[0], sales: 45 },
    { product: mockProducts[1], sales: 38 },
    { product: mockProducts[2], sales: 67 },
    { product: mockProducts[3], sales: 234 }
  ]
};

// Service Health (for IT Admin)
export const mockServiceHealth: ServiceHealth[] = [
  { name: 'Gateway', status: 'UP', responseTime: 45, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Eureka Server', status: 'UP', responseTime: 12, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Order Service', status: 'UP', responseTime: 78, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Catalog Service', status: 'UP', responseTime: 56, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Customer Service', status: 'UP', responseTime: 43, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Payment Service', status: 'DEGRADED', responseTime: 234, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Notification Service', status: 'UP', responseTime: 89, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Integration Service', status: 'UP', responseTime: 123, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'REST Provider', status: 'UP', responseTime: 156, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'SOAP Provider', status: 'UP', responseTime: 189, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'gRPC Provider', status: 'UP', responseTime: 67, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'MySQL Database', status: 'UP', responseTime: 23, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Kafka', status: 'UP', responseTime: 34, lastCheck: '2024-11-24T12:00:00Z' },
  { name: 'Redis', status: 'UP', responseTime: 5, lastCheck: '2024-11-24T12:00:00Z' }
];

export const mockSystemMetrics: SystemMetrics = {
  cpuUsage: 45,
  memoryUsage: 67,
  diskUsage: 34,
  activeConnections: 156,
  requestsPerMinute: 234
};

export const mockEventLogs: EventLog[] = [
  { id: '1', timestamp: '2024-11-24T11:58:32Z', service: 'Order Service', eventType: 'ORDER_CREATED', message: 'New order ORD-2024-156 created', severity: 'INFO' },
  { id: '2', timestamp: '2024-11-24T11:55:12Z', service: 'Payment Service', eventType: 'PAYMENT_TIMEOUT', message: 'Payment timeout for order ORD-2024-155', severity: 'WARN' },
  { id: '3', timestamp: '2024-11-24T11:52:45Z', service: 'Integration Service', eventType: 'PROVIDER_SYNC', message: 'REST provider sync completed', severity: 'INFO' },
  { id: '4', timestamp: '2024-11-24T11:50:00Z', service: 'Customer Service', eventType: 'USER_REGISTERED', message: 'New customer registered: user@example.com', severity: 'INFO' },
  { id: '5', timestamp: '2024-11-24T11:45:23Z', service: 'Notification Service', eventType: 'EMAIL_FAILED', message: 'Failed to send email to customer@test.com', severity: 'ERROR' }
];

export const mockIntegrationStatus: IntegrationStatus[] = [
  { name: 'REST Provider (Productos Físicos)', type: 'REST', endpoint: 'http://rest-provider:8081', status: 'CONNECTED', lastSync: '2024-11-24T12:00:00Z', successRate: 99.8, avgResponseTime: 156 },
  { name: 'SOAP Provider (Servicios)', type: 'SOAP', endpoint: 'http://soap-provider:8082', status: 'CONNECTED', lastSync: '2024-11-24T11:55:00Z', successRate: 98.5, avgResponseTime: 189 },
  { name: 'gRPC Provider (Suscripciones)', type: 'GRPC', endpoint: 'grpc-provider:50051', status: 'CONNECTED', lastSync: '2024-11-24T11:58:00Z', successRate: 99.9, avgResponseTime: 67 }
];

// Content Items (for Content Admin)
export const mockContentItems: ContentItem[] = [
  {
    id: '1',
    type: 'BANNER',
    title: 'Black Friday - 50% OFF',
    content: 'Los mejores descuentos del año',
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200',
    targetUrl: '/catalog?sale=true',
    startDate: '2024-11-22',
    endDate: '2024-11-29',
    isActive: true,
    position: 1,
    createdAt: '2024-11-20T10:00:00Z'
  },
  {
    id: '2',
    type: 'PROMOTION',
    title: 'Cyber Monday',
    content: 'Ofertas exclusivas en electrónica',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    targetUrl: '/catalog?type=PHYSICAL&category=1',
    startDate: '2024-12-02',
    endDate: '2024-12-02',
    isActive: false,
    position: 2,
    createdAt: '2024-11-21T14:00:00Z'
  }
];

// Helper functions
export const getUserByEmail = (email: string) => mockUsers.find(u => u.email === email);
export const getOrderById = (id: number) => mockOrders.find(o => o.id === id);
export const getProductById = (id: number) => mockProducts.find(p => p.id === id);
export const getCustomerById = (id: number) => mockCustomers.find(c => c.id === id);
