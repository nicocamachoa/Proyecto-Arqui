import { useState, useCallback, useEffect } from 'react';
import { orderService, getErrorMessage } from '../services';
import { Order, CheckoutData } from '../models';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';

export const useOrders = () => {
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrders(user.id);
      setOrders(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createOrder = useCallback(async (orderData: {
    items: { productId: number; quantity: number; price: number }[];
    shippingAddress?: Record<string, string>;
    paymentMethod: string;
  }) => {
    if (!user) throw new Error('Usuario no autenticado');

    setIsLoading(true);
    setError(null);

    try {
      const order = await orderService.createOrderDirect(user.id, orderData);
      setOrders(prev => [order, ...prev]);
      clearCart();
      return order;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, clearCart]);

  // Filter orders by type
  const physicalOrders = orders.filter(o => o.orderType === 'PHYSICAL' || o.items.some(i => i.productType === 'PHYSICAL'));
  const serviceOrders = orders.filter(o => o.orderType === 'SERVICE' || o.items.some(i => i.productType === 'SERVICE'));
  const subscriptionOrders = orders.filter(o => o.orderType === 'SUBSCRIPTION' || o.items.some(i => i.productType === 'SUBSCRIPTION'));

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  return {
    orders,
    physicalOrders,
    serviceOrders,
    subscriptionOrders,
    isLoading,
    error,
    createOrder,
    refetch: fetchOrders,
  };
};

export const useOrder = (orderId: number | null) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<{ status: string; location?: string; estimatedDelivery?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);

      // Fetch tracking for physical orders
      if (data.orderType === 'PHYSICAL' || data.items.some(i => i.productType === 'PHYSICAL')) {
        const trackingData = await orderService.getOrderTracking(id);
        setTracking(trackingData);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async () => {
    if (!order) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrder(updated);
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [order]);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  return {
    order,
    tracking,
    isLoading,
    error,
    cancelOrder,
    refetch: () => orderId && fetchOrder(orderId),
  };
};

export const useCheckout = () => {
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const processCheckout = useCallback(async (
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL',
    shippingAddressId?: number
  ) => {
    if (!user || items.length === 0) {
      throw new Error('Carrito vacío o usuario no autenticado');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const checkoutData: CheckoutData = {
        items,
        shippingAddressId,
        paymentMethod,
      };

      const order = await orderService.createOrder(checkoutData, user.id);
      setCompletedOrder(order);
      clearCart();
      return order;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [user, items, clearCart]);

  const resetCheckout = useCallback(() => {
    setCompletedOrder(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    completedOrder,
    processCheckout,
    resetCheckout,
  };
};

// Specialized hooks for different order types
export const usePhysicalOrders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await orderService.getPhysicalOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching physical orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
};

export const useServiceOrders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await orderService.getServiceOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching service orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
};

export const useSubscriptionOrders = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await orderService.getSubscriptionOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching subscription orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
};

export default useOrders;
