import { useState, useEffect } from 'react';
import { operacionesService, negocioService } from '../../services';
import { Order, Product, DashboardStats } from '../../models';

export const DashboardOperaciones = () => {
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [ordersData, statsData, lowStockData] = await Promise.all([
          operacionesService.getOrders(),
          negocioService.getDashboardStats(),
          operacionesService.getLowStockProducts(),
        ]);
        setOrders(ordersData);
        setStats(statsData);
        setLowStockProducts(lowStockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const updatedOrder = await operacionesService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const markAsShipped = async (orderId: number) => {
    try {
      const updatedOrder = await operacionesService.markAsShipped(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error('Error marking as shipped:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-info',
      PROCESSING: 'badge-info',
      SHIPPED: 'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      PROCESSING: 'Procesando',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{labels[status] || status}</span>;
  };

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderFilter);

  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const shippedTodayOrders = orders.filter(o => {
    if (o.status !== 'SHIPPED') return false;
    const today = new Date().toDateString();
    return new Date(o.updatedAt || o.createdAt).toDateString() === today;
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pedidos Pendientes</p>
              <p className="stat-value text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">En Proceso</p>
              <p className="stat-value text-blue-600">{processingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Enviados Hoy</p>
              <p className="stat-value text-green-600">{shippedTodayOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Stock Bajo</p>
              <p className="stat-value text-red-600">{lowStockProducts.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Management */}
        <div className="lg:col-span-2 card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Gestión de Pedidos</h3>
            <div className="flex gap-2">
              {['all', 'PENDING', 'PROCESSING', 'SHIPPED'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    orderFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y">
            {filteredOrders.map(order => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold">{order.orderNumber}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>{order.customerName} - {order.customerEmail}</p>
                    <p>{order.items.length} productos - ${order.total.toFixed(2)}</p>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="btn-primary text-sm py-1"
                      >
                        Confirmar
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                        className="btn-primary text-sm py-1"
                      >
                        Procesar
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => markAsShipped(order.id)}
                        className="btn-primary text-sm py-1"
                      >
                        Marcar Enviado
                      </button>
                    )}
                    <button className="btn-secondary text-sm py-1">
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Alertas de Inventario</h3>
          </div>

          <div className="divide-y">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Todo el inventario está en niveles normales</p>
              </div>
            ) : (
              lowStockProducts.map(product => (
                <div key={product.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-semibold">{product.stock} unidades</p>
                      <p className="text-xs text-gray-400">Min: {product.lowStockThreshold}</p>
                    </div>
                  </div>
                  <button className="mt-2 w-full btn-secondary text-sm py-1">
                    Solicitar Reposición
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Shipping Queue */}
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Cola de Envíos</h3>
          <button className="btn-primary text-sm">
            Generar Etiquetas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3">Pedido</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Dirección</th>
                <th className="px-6 py-3">Productos</th>
                <th className="px-6 py-3">Prioridad</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').map(order => (
                <tr key={order.id}>
                  <td className="table-cell">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="table-cell font-medium">{order.orderNumber}</td>
                  <td className="table-cell">{order.customerName}</td>
                  <td className="table-cell text-gray-500 text-sm">
                    San José, Costa Rica
                  </td>
                  <td className="table-cell">{order.items.length} items</td>
                  <td className="table-cell">
                    <span className="badge badge-warning">Normal</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button className="text-primary-600 hover:text-primary-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => markAsShipped(order.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <h4 className="font-medium">Imprimir Picking List</h4>
          <p className="text-sm text-gray-500 mt-1">Generar lista de productos a preparar</p>
        </div>

        <div className="card p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h4 className="font-medium">Reporte de Inventario</h4>
          <p className="text-sm text-gray-500 mt-1">Exportar estado actual del inventario</p>
        </div>

        <div className="card p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="font-medium">Estadísticas de Envío</h4>
          <p className="text-sm text-gray-500 mt-1">Ver métricas de tiempos de entrega</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOperaciones;
