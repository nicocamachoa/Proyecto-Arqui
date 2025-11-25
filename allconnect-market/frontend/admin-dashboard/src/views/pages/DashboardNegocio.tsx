import { useState, useEffect } from 'react';
import { negocioService } from '../../services';
import { DashboardStats, Order, Customer } from '../../models';

export const DashboardNegocio = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, ordersData, customersData] = await Promise.all([
          negocioService.getDashboardStats(),
          negocioService.getOrders(),
          negocioService.getCustomers(),
        ]);
        setStats(statsData);
        setOrders(ordersData);
        setCustomers(customersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-info',
      PROCESSING: 'badge-info',
      SHIPPED: 'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{status}</span>;
  };

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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Ingresos Totales</p>
              <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+12.5% vs mes anterior</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pedidos Totales</p>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">{stats.pendingOrders} pendientes</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Clientes</p>
              <p className="stat-value">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">+5 nuevos esta semana</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Productos</p>
              <p className="stat-value">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">{stats.lowStockProducts} con bajo stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Pedidos Recientes</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todos
            </button>
          </div>
          <div className="divide-y">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.total.toFixed(2)}</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Productos Más Vendidos</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todos
            </button>
          </div>
          <div className="divide-y">
            {stats.topProducts.map((item, index) => (
              <div key={item.product.id} className="px-6 py-4 flex items-center gap-4">
                <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{item.product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.sales} ventas</p>
                  <p className="text-sm text-gray-500">${item.product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Chart Placeholder */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ventas de la Semana</h3>
        <div className="h-64 flex items-end gap-4 px-4">
          {stats.salesByDay.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary-500 rounded-t"
                style={{ height: `${(day.revenue / 6000) * 200}px` }}
              />
              <span className="text-xs text-gray-500 mt-2">
                {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span className="text-xs font-medium">${(day.revenue / 1000).toFixed(1)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Customers */}
      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Clientes Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Pedidos</th>
                <th className="px-6 py-3">Total Gastado</th>
                <th className="px-6 py-3">Último Pedido</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 text-sm font-medium">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </span>
                      </div>
                      {customer.firstName} {customer.lastName}
                    </div>
                  </td>
                  <td className="table-cell text-gray-500">{customer.email}</td>
                  <td className="table-cell">{customer.ordersCount}</td>
                  <td className="table-cell font-medium">${customer.totalSpent.toFixed(2)}</td>
                  <td className="table-cell text-gray-500">
                    {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardNegocio;
