import api, { USE_MOCK } from './api';
import { Order, CheckoutData, PaginatedResponse } from '../models';
import { mockOrders, mockProducts } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory order storage for mock mode
let mockOrderCounter = mockOrders.length;
const createdOrders: Order[] = [...mockOrders];

export const orderService = {
  getOrders: async (customerId: number): Promise<Order[]> => {
    if (USE_MOCK) {
      await delay(300);
      return createdOrders.filter(o => o.customerId === customerId);
    }

    const response = await api.get<Order[]>(`/orders/customer/${customerId}`);
    return response.data;
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    if (USE_MOCK) {
      await delay(200);
      const order = createdOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Orden no encontrada');
      }
      return order;
    }

    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    if (USE_MOCK) {
      await delay(200);
      const order = createdOrders.find(o => o.orderNumber === orderNumber);
      if (!order) {
        throw new Error('Orden no encontrada');
      }
      return order;
    }

    const response = await api.get<Order>(`/orders/number/${orderNumber}`);
    return response.data;
  },

  createOrder: async (checkoutData: CheckoutData, customerId: number): Promise<Order> => {
    if (USE_MOCK) {
      await delay(1000); // Simulate processing time

      mockOrderCounter++;
      const orderNumber = `ORD-2024-${String(mockOrderCounter).padStart(4, '0')}`;

      const subtotal = checkoutData.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const tax = subtotal * 0.13;
      const shippingCost = checkoutData.items.some(i => i.product.productType === 'PHYSICAL') ? 15 : 0;
      const total = subtotal + tax + shippingCost;

      // Determine order type
      const types = new Set(checkoutData.items.map(i => i.product.productType));
      let orderType: 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION' | 'MIXED' = 'MIXED';
      if (types.size === 1) {
        orderType = types.values().next().value as 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';
      }

      const newOrder: Order = {
        id: mockOrderCounter,
        orderNumber,
        customerId,
        status: 'CONFIRMED',
        orderType,
        subtotal,
        tax,
        shippingCost,
        discount: 0,
        total,
        currency: 'USD',
        items: checkoutData.items.map((item, idx) => ({
          id: mockOrderCounter * 100 + idx,
          orderId: mockOrderCounter,
          productId: item.productId,
          productSku: item.product.sku,
          productName: item.product.name,
          productType: item.product.productType,
          quantity: item.quantity,
          unitPrice: item.product.price,
          price: item.product.price,
          totalPrice: item.product.price * item.quantity,
          providerType: item.product.providerType,
          reservationDate: item.reservationDate,
          reservationCode: item.product.productType === 'SERVICE'
            ? `RES-${Date.now()}`
            : undefined,
          subscriptionStart: item.product.productType === 'SUBSCRIPTION'
            ? new Date().toISOString().split('T')[0]
            : undefined,
          subscriptionEnd: item.product.productType === 'SUBSCRIPTION'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : undefined,
          status: 'CONFIRMED',
        })),
        statusHistory: [
          {
            id: 1,
            orderId: mockOrderCounter,
            status: 'PENDING',
            comment: 'Orden creada',
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            orderId: mockOrderCounter,
            status: 'CONFIRMED',
            comment: 'Pago confirmado',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createdOrders.push(newOrder);
      return newOrder;
    }

    const response = await api.post<Order>('/orders', checkoutData);
    return response.data;
  },

  cancelOrder: async (orderId: number): Promise<Order> => {
    if (USE_MOCK) {
      await delay(500);
      const order = createdOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Orden no encontrada');
      }
      if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
        throw new Error('No se puede cancelar esta orden');
      }
      order.status = 'CANCELLED';
      order.statusHistory?.push({
        id: (order.statusHistory?.length || 0) + 1,
        orderId,
        status: 'CANCELLED',
        comment: 'Cancelado por el cliente',
        createdAt: new Date().toISOString(),
      });
      return order;
    }

    const response = await api.post<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  },

  getOrderTracking: async (orderId: number): Promise<{ status: string; location?: string; estimatedDelivery?: string }> => {
    if (USE_MOCK) {
      await delay(300);
      const order = createdOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Orden no encontrada');
      }

      // Mock tracking data
      const trackingData: Record<string, { location: string; estimatedDelivery: string }> = {
        CONFIRMED: { location: 'Preparando en almacén', estimatedDelivery: '3-5 días hábiles' },
        PROCESSING: { location: 'En centro de distribución', estimatedDelivery: '2-4 días hábiles' },
        SHIPPED: { location: 'En tránsito - San José', estimatedDelivery: '1-2 días hábiles' },
        DELIVERED: { location: 'Entregado', estimatedDelivery: 'Entregado' },
      };

      return {
        status: order.status,
        ...trackingData[order.status],
      };
    }

    const response = await api.get<{ status: string; location?: string; estimatedDelivery?: string }>(
      `/orders/${orderId}/tracking`
    );
    return response.data;
  },

  // Simplified create order for checkout
  createOrderDirect: async (customerId: number, orderData: {
    items: { productId: number; quantity: number; price: number }[];
    shippingAddress?: Record<string, string>;
    paymentMethod: string;
  }): Promise<Order> => {
    if (USE_MOCK) {
      await delay(1000);

      mockOrderCounter++;
      const orderNumber = `ORD-2024-${String(mockOrderCounter).padStart(4, '0')}`;

      const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.13;
      const total = subtotal + tax;

      const newOrder: Order = {
        id: mockOrderCounter,
        orderNumber,
        customerId,
        status: 'CONFIRMED',
        orderType: 'MIXED',
        subtotal,
        tax,
        shippingCost: 0,
        discount: 0,
        total,
        currency: 'USD',
        items: orderData.items.map((item, idx) => ({
          id: mockOrderCounter * 100 + idx,
          orderId: mockOrderCounter,
          productId: item.productId,
          productSku: `SKU-${item.productId}`,
          productName: `Producto ${item.productId}`,
          productType: 'PHYSICAL' as const,
          quantity: item.quantity,
          unitPrice: item.price,
          price: item.price,
          totalPrice: item.price * item.quantity,
          providerType: 'REST' as const,
          status: 'CONFIRMED' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      createdOrders.push(newOrder);
      return newOrder;
    }

    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  // Get orders by type for dashboard sections
  getPhysicalOrders: async (customerId: number): Promise<Order[]> => {
    const orders = await orderService.getOrders(customerId);
    return orders.filter(o => o.orderType === 'PHYSICAL' || o.items.some(i => i.productType === 'PHYSICAL'));
  },

  getServiceOrders: async (customerId: number): Promise<Order[]> => {
    const orders = await orderService.getOrders(customerId);
    return orders.filter(o => o.orderType === 'SERVICE' || o.items.some(i => i.productType === 'SERVICE'));
  },

  getSubscriptionOrders: async (customerId: number): Promise<Order[]> => {
    const orders = await orderService.getOrders(customerId);
    return orders.filter(o => o.orderType === 'SUBSCRIPTION' || o.items.some(i => i.productType === 'SUBSCRIPTION'));
  },
};

export default orderService;
