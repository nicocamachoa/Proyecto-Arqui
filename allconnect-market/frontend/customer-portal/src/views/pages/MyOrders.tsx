import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../viewmodels';
import { Order } from '../../models';

export const MyOrders = () => {
  const { physicalOrders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CREATED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      CREATED: 'Creado',
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      PROCESSING: 'En proceso',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Helper to parse shipping address (can be JSON string or object)
  const parseShippingAddress = (address: unknown): { street?: string; city?: string; state?: string; zipCode?: string } | null => {
    if (!address) return null;
    if (typeof address === 'string') {
      try {
        return JSON.parse(address);
      } catch {
        return { street: address, city: '', state: '', zipCode: '' };
      }
    }
    return address as { street?: string; city?: string; state?: string; zipCode?: string };
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (physicalOrders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          className="w-24 h-24 text-gray-300 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No tienes pedidos</h2>
        <p className="text-gray-500 mb-8">
          Cuando realices una compra de productos físicos, aparecerán aquí
        </p>
        <Link to="/catalog?type=PHYSICAL" className="btn-primary">
          Explorar Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {physicalOrders.map((order) => (
            <div
              key={order.id}
              className={`card p-6 cursor-pointer transition-all ${
                selectedOrder?.id === order.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">Pedido</span>
                  <h3 className="font-semibold">#{order.orderNumber || String(order.id).padStart(8, '0')}</h3>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center gap-4 mb-4">
                {order.items.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">+{order.items.length - 3}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-semibold">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Detail */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Detalle del Pedido</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Estado</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Productos</span>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.productName || item.product?.name || 'Producto'} x{item.quantity}
                        </span>
                        <span>${(item.totalPrice || (item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <hr />

                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Impuestos</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>

                {selectedOrder.shippingAddress && (() => {
                  const addr = parseShippingAddress(selectedOrder.shippingAddress);
                  return addr && (addr.street || addr.city) ? (
                    <div className="pt-4 border-t">
                      <span className="text-sm text-gray-500">Dirección de envío</span>
                      <p className="text-sm mt-1">
                        {addr.street && <>{addr.street}<br /></>}
                        {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode || ''}
                      </p>
                    </div>
                  ) : null;
                })()}

                {selectedOrder.status === 'SHIPPED' && (
                  <div className="pt-4 border-t">
                    <span className="text-sm text-gray-500">Seguimiento</span>
                    <a href="#" className="block text-primary-600 hover:text-primary-700 text-sm mt-1">
                      Ver en mensajería →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p>Selecciona un pedido para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
