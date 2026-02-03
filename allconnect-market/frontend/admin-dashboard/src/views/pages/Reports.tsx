import { useState, useEffect } from 'react';
import { negocioService } from '../../services';
import { Order, Product, Customer, DashboardStats } from '../../models';

export const Reports = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, ordersData, productsData, customersData] = await Promise.all([
          negocioService.getDashboardStats(),
          negocioService.getOrders(),
          negocioService.getProducts(),
          negocioService.getCustomers(),
        ]);
        setStats(statsData);
        setOrders(ordersData);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate analytics
  const calculateProviderSales = () => {
    const providers = ['REST', 'SOAP', 'GRPC'];
    return providers.map(provider => {
      const providerOrders = orders.filter(o =>
        o.items.some(item => item.productType === getProviderType(provider))
      );
      const revenue = providerOrders.reduce((sum, o) => sum + o.total, 0);
      return { provider, revenue, orders: providerOrders.length };
    });
  };

  const getProviderType = (provider: string) => {
    switch (provider) {
      case 'REST': return 'PHYSICAL';
      case 'SOAP': return 'SERVICE';
      case 'GRPC': return 'SUBSCRIPTION';
      default: return '';
    }
  };

  const calculateOrdersByStatus = () => {
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  };

  const calculateTopCustomers = () => {
    return customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  };

  const calculateProductsByType = () => {
    const types: Record<string, number> = {
      PHYSICAL: 0,
      SERVICE: 0,
      SUBSCRIPTION: 0
    };
    products.forEach(p => {
      types[p.productType] = (types[p.productType] || 0) + 1;
    });
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  };

  const calculateAverageOrderValue = () => {
    if (orders.length === 0) return 0;
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    return total / orders.length;
  };

  const getProviderBadge = (provider: string) => {
    const styles: Record<string, string> = {
      REST: 'bg-blue-100 text-blue-800',
      SOAP: 'bg-purple-100 text-purple-800',
      GRPC: 'bg-green-100 text-green-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${styles[provider]}`}>{provider}</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6 h-64 bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const providerSales = calculateProviderSales();
  const ordersByStatus = calculateOrdersByStatus();
  const topCustomers = calculateTopCustomers();
  const productsByType = calculateProductsByType();
  const avgOrderValue = calculateAverageOrderValue();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Negocio</h1>
          <p className="text-gray-500">Análisis y estadísticas detalladas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded ${selectedPeriod === 'week' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded ${selectedPeriod === 'month' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Mes
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded ${selectedPeriod === 'year' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900">${avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.length > 0 ? ((orders.length / customers.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Provider */}
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Ventas por Proveedor</h3>
            <p className="text-sm text-gray-500">Distribución de ingresos por tipo de proveedor</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {providerSales.map(({ provider, revenue, orders }) => {
                const percentage = stats.totalRevenue > 0 ? (revenue / stats.totalRevenue) * 100 : 0;
                return (
                  <div key={provider}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getProviderBadge(provider)}
                        <span className="text-sm font-medium text-gray-700">
                          {provider === 'REST' ? 'Físicos' : provider === 'SOAP' ? 'Servicios' : 'Suscripciones'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{orders} órdenes</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          provider === 'REST' ? 'bg-blue-500' :
                          provider === 'SOAP' ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% del total</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Estado de Pedidos</h3>
            <p className="text-sm text-gray-500">Distribución actual de órdenes</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {ordersByStatus.map(({ status, count }) => {
                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                const statusColors: Record<string, string> = {
                  PENDING: 'bg-yellow-500',
                  CONFIRMED: 'bg-blue-500',
                  PROCESSING: 'bg-indigo-500',
                  SHIPPED: 'bg-purple-500',
                  DELIVERED: 'bg-green-500',
                  CANCELLED: 'bg-red-500',
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-700">{status}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Top 5 Clientes</h3>
            <p className="text-sm text-gray-500">Clientes con mayor gasto total</p>
          </div>
          <div className="divide-y">
            {topCustomers.length > 0 ? topCustomers.map((customer, index) => (
              <div key={customer.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{customer.ordersCount} órdenes</p>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No hay datos de clientes disponibles
              </div>
            )}
          </div>
        </div>

        {/* Products by Type */}
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">Distribución de Productos</h3>
            <p className="text-sm text-gray-500">Por tipo de producto</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {productsByType.map(({ type, count }) => {
                const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                const typeLabels: Record<string, string> = {
                  PHYSICAL: 'Físicos',
                  SERVICE: 'Servicios',
                  SUBSCRIPTION: 'Suscripciones'
                };
                const typeColors: Record<string, string> = {
                  PHYSICAL: 'bg-blue-500',
                  SERVICE: 'bg-purple-500',
                  SUBSCRIPTION: 'bg-green-500'
                };
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{typeLabels[type]}</span>
                      <span className="text-sm font-semibold text-gray-900">{count} productos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${typeColors[type]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% del catálogo</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Tendencia de Ventas</h3>
          <p className="text-sm text-gray-500">Últimos 7 días</p>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end gap-4">
            {stats.salesByDay && stats.salesByDay.map((day, index) => {
              const maxRevenue = Math.max(...stats.salesByDay.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 200 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full group">
                    <div
                      className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer"
                      style={{ height: `${height}px` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        ${day.revenue.toFixed(2)}
                        <br />
                        {day.orders} órdenes
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                  </span>
                  <span className="text-xs font-medium">${(day.revenue / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
