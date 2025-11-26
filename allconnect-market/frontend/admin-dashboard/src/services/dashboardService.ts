import api, { USE_MOCK, USE_MOCK_IT } from './api';
import {
  DashboardStats,
  Order,
  Product,
  Customer,
  ServiceHealth,
  SystemMetrics,
  EventLog,
  IntegrationStatus,
  ContentItem
} from '../models';
import {
  mockDashboardStats,
  mockOrders,
  mockProducts,
  mockCustomers,
  mockServiceHealth,
  mockSystemMetrics,
  mockEventLogs,
  mockIntegrationStatus,
  mockContentItems
} from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= NEGOCIO ADMIN SERVICES =============

export const negocioService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK) {
      await delay(300);
      return mockDashboardStats;
    }
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  },

  getOrders: async (filters?: { status?: string; page?: number; limit?: number }): Promise<Order[]> => {
    if (USE_MOCK) {
      await delay(300);
      let orders = [...mockOrders];
      if (filters?.status) {
        orders = orders.filter(o => o.status === filters.status);
      }
      return orders;
    }
    const response = await api.get<Order[]>('/admin/orders', { params: filters });
    return response.data;
  },

  getCustomers: async (): Promise<Customer[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockCustomers;
    }
    const response = await api.get<Customer[]>('/admin/customers');
    return response.data;
  },

  getProducts: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockProducts;
    }
    const response = await api.get<Product[]>('/admin/products');
    return response.data;
  },
};

// ============= CONTENIDO ADMIN SERVICES =============

export const contenidoService = {
  getProducts: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockProducts;
    }
    const response = await api.get<Product[]>('/admin/catalog/products');
    return response.data;
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    if (USE_MOCK) {
      await delay(500);
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Producto no encontrado');
      return { ...product, ...data };
    }
    const response = await api.put<Product>(`/admin/catalog/products/${id}`, data);
    return response.data;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    if (USE_MOCK) {
      await delay(500);
      const newProduct: Product = {
        id: mockProducts.length + 1,
        sku: data.sku || `SKU-${Date.now()}`,
        name: data.name || 'Nuevo Producto',
        price: data.price || 0,
        productType: data.productType || 'PHYSICAL',
        categoryId: data.categoryId || 1,
        providerType: data.providerType || 'REST',
        stock: data.stock || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        ratingAverage: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
      };
      return newProduct;
    }
    const response = await api.post<Product>('/admin/catalog/products', data);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      return;
    }
    await api.delete(`/admin/catalog/products/${id}`);
  },

  getContentItems: async (): Promise<ContentItem[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockContentItems;
    }
    const response = await api.get<ContentItem[]>('/admin/content/items');
    return response.data;
  },

  updateContentItem: async (id: string, data: Partial<ContentItem>): Promise<ContentItem> => {
    if (USE_MOCK) {
      await delay(500);
      const item = mockContentItems.find(c => c.id === id);
      if (!item) throw new Error('Contenido no encontrado');
      return { ...item, ...data };
    }
    const response = await api.put<ContentItem>(`/admin/content/items/${id}`, data);
    return response.data;
  },

  toggleProductActive: async (id: number, isActive: boolean): Promise<Product> => {
    if (USE_MOCK) {
      await delay(300);
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Producto no encontrado');
      return { ...product, isActive };
    }
    const response = await api.patch<Product>(`/admin/catalog/products/${id}/status`, { isActive });
    return response.data;
  },

  toggleProductFeatured: async (id: number, isFeatured: boolean): Promise<Product> => {
    if (USE_MOCK) {
      await delay(300);
      const product = mockProducts.find(p => p.id === id);
      if (!product) throw new Error('Producto no encontrado');
      return { ...product, isFeatured };
    }
    const response = await api.patch<Product>(`/admin/catalog/products/${id}/featured`, { isFeatured });
    return response.data;
  },
};

// ============= IT ADMIN SERVICES =============
// IT Admin services use real data by default (USE_MOCK_IT = false)

export const itService = {
  getServiceHealth: async (): Promise<ServiceHealth[]> => {
    if (USE_MOCK_IT) {
      await delay(300);
      return mockServiceHealth;
    }
    const response = await api.get<ServiceHealth[]>('/admin/it/services/health');
    return response.data;
  },

  getSystemMetrics: async (): Promise<SystemMetrics> => {
    if (USE_MOCK_IT) {
      await delay(300);
      return mockSystemMetrics;
    }
    const response = await api.get<SystemMetrics>('/admin/it/metrics');
    return response.data;
  },

  getEventLogs: async (filters?: { service?: string; severity?: string }): Promise<EventLog[]> => {
    if (USE_MOCK_IT) {
      await delay(300);
      let logs = [...mockEventLogs];
      if (filters?.service) {
        logs = logs.filter(l => l.service === filters.service);
      }
      if (filters?.severity) {
        logs = logs.filter(l => l.severity === filters.severity);
      }
      return logs;
    }
    const response = await api.get<EventLog[]>('/admin/it/logs', { params: filters });
    return response.data;
  },

  getIntegrationStatus: async (): Promise<IntegrationStatus[]> => {
    if (USE_MOCK_IT) {
      await delay(300);
      return mockIntegrationStatus;
    }
    const response = await api.get<IntegrationStatus[]>('/admin/it/integrations');
    return response.data;
  },

  testConnection: async (integrationName: string): Promise<{ success: boolean; responseTime: number }> => {
    if (USE_MOCK_IT) {
      await delay(1000);
      return { success: true, responseTime: Math.floor(Math.random() * 200) + 50 };
    }
    const response = await api.post<{ success: boolean; responseTime: number }>('/admin/it/integrations/test', { name: integrationName });
    return response.data;
  },

  forceSync: async (integrationName: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_IT) {
      await delay(2000);
      return { success: true };
    }
    const response = await api.post<{ success: boolean }>('/admin/it/integrations/sync', { name: integrationName });
    return response.data;
  },
};

// ============= OPERACIONES ADMIN SERVICES =============

export const operacionesService = {
  getOrders: async (filters?: { status?: string; orderType?: string }): Promise<Order[]> => {
    if (USE_MOCK) {
      await delay(300);
      let orders = [...mockOrders];
      if (filters?.status) {
        orders = orders.filter(o => o.status === filters.status);
      }
      if (filters?.orderType) {
        orders = orders.filter(o => o.orderType === filters.orderType);
      }
      return orders;
    }
    const response = await api.get<Order[]>('/admin/operations/orders', { params: filters });
    return response.data;
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(500);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) throw new Error('Orden no encontrada');
      return { ...order, status: status as Order['status'] };
    }
    const response = await api.patch<Order>(`/admin/operations/orders/${orderId}/status`, { status });
    return response.data;
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockProducts.filter(p => p.stock <= p.lowStockThreshold);
    }
    const response = await api.get<Product[]>('/admin/operations/inventory/low-stock');
    return response.data;
  },

  updateStock: async (productId: number, stock: number): Promise<Product> => {
    if (USE_MOCK) {
      await delay(300);
      const product = mockProducts.find(p => p.id === productId);
      if (!product) throw new Error('Producto no encontrado');
      return { ...product, stock };
    }
    const response = await api.patch<Product>(`/admin/operations/inventory/${productId}/stock`, { stock });
    return response.data;
  },

  getShippingQueue: async (): Promise<Order[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockOrders.filter(o => o.orderType === 'PHYSICAL' && ['CONFIRMED', 'PROCESSING'].includes(o.status));
    }
    const response = await api.get<Order[]>('/admin/operations/shipping/queue');
    return response.data;
  },

  markAsShipped: async (orderId: number, trackingNumber?: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(500);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) throw new Error('Orden no encontrada');
      return { ...order, status: 'SHIPPED' };
    }
    const response = await api.patch<Order>(`/admin/operations/orders/${orderId}/ship`, { trackingNumber });
    return response.data;
  },
};

export default {
  negocio: negocioService,
  contenido: contenidoService,
  it: itService,
  operaciones: operacionesService,
};
