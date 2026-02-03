import { useState, useEffect } from 'react';
import { operacionesService } from '../../services';
import { Order } from '../../models';

export const Shipping = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await operacionesService.getShippingQueue();
        setOrders(data);
      } catch (err) {
        console.error('Error loading shipping queue:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleMarkAsShipped = async (orderId: number) => {
    try {
      await operacionesService.markAsShipped(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error marking as shipped:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-info',
      PROCESSING: 'badge-info',
      SHIPPED: 'badge-success',
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{status}</span>;
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cola de Envíos</h1>
          <p className="text-gray-500">Pedidos pendientes de envío</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Pendientes de Envío</p>
          <p className="stat-value text-yellow-600">{orders.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Confirmados</p>
          <p className="stat-value">{orders.filter(o => o.status === 'CONFIRMED').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">En Procesamiento</p>
          <p className="stat-value">{orders.filter(o => o.status === 'PROCESSING').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Enviados Hoy</p>
          <p className="stat-value text-green-600">12</p>
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Pedidos Listos para Enviar</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">¡No hay pedidos pendientes de envío!</p>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map(order => (
              <div key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Items del pedido:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.items?.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>${item.totalPrice.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Número de tracking (opcional)"
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => handleMarkAsShipped(order.id)}
                    className="btn-primary whitespace-nowrap"
                  >
                    Marcar como Enviado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shipping;
