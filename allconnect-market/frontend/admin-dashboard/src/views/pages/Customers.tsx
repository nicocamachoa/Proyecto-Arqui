import { useState, useEffect } from 'react';
import { negocioService } from '../../services';
import { Customer } from '../../models';

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await negocioService.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error('Error loading customers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-500">Visualiza y administra la base de clientes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Total Clientes</p>
          <p className="stat-value">{customers.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Clientes Activos</p>
          <p className="stat-value">{customers.filter(c => c.ordersCount > 0).length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Ingresos Totales</p>
          <p className="stat-value">
            ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pedidos Totales</p>
          <p className="stat-value">
            {customers.reduce((sum, c) => sum + c.ordersCount, 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full max-w-md"
        />
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {filteredCustomers.length} clientes encontrados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3">Pedidos</th>
                <th className="px-6 py-3">Total Gastado</th>
                <th className="px-6 py-3">Último Pedido</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-gray-500">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-gray-500">{customer.email}</td>
                  <td className="table-cell text-gray-500">{customer.phone || '-'}</td>
                  <td className="table-cell">
                    <span className="badge badge-info">{customer.ordersCount} pedidos</span>
                  </td>
                  <td className="table-cell font-medium">${customer.totalSpent.toFixed(2)}</td>
                  <td className="table-cell text-gray-500">
                    {customer.lastOrderAt
                      ? new Date(customer.lastOrderAt).toLocaleDateString()
                      : 'Sin pedidos'}
                  </td>
                  <td className="table-cell">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Ver perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      )}
    </div>
  );
};

export default Customers;
