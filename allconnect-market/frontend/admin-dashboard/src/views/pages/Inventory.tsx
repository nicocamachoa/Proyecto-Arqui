import { useState, useEffect } from 'react';
import { operacionesService, negocioService } from '../../services';
import { Product } from '../../models';

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        const [allProducts, lowStock] = await Promise.all([
          negocioService.getProducts(),
          operacionesService.getLowStockProducts()
        ]);
        setProducts(allProducts);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error('Error loading inventory:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInventory();
  }, []);

  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      await operacionesService.updateStock(productId, newStock);
      setProducts(products.map(p =>
        p.id === productId ? { ...p, stock: newStock } : p
      ));
      setLowStockProducts(lowStockProducts.filter(p => p.id !== productId || newStock <= p.lowStockThreshold));
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: 'Sin Stock', class: 'badge-danger' };
    if (product.stock <= product.lowStockThreshold) return { label: 'Stock Bajo', class: 'badge-warning' };
    return { label: 'En Stock', class: 'badge-success' };
  };

  const filteredProducts = filter === 'all'
    ? products
    : filter === 'low'
      ? lowStockProducts
      : products.filter(p => p.stock === 0);

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

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Inventario</h1>
          <p className="text-gray-500">Gestiona el stock de productos</p>
        </div>
        <button className="btn-primary">+ Ajustar Stock Masivo</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Total Productos</p>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Stock Total</p>
          <p className="stat-value">{totalStock.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Stock Bajo</p>
          <p className="stat-value text-yellow-600">{lowStockProducts.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Sin Stock</p>
          <p className="stat-value text-red-600">{outOfStock}</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="px-6 py-4 border-b border-yellow-200">
            <h3 className="font-semibold text-yellow-800">⚠️ Productos con Stock Bajo</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.slice(0, 6).map(product => (
              <div key={product.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-600 font-semibold">Stock: {product.stock}</span>
                  <button
                    onClick={() => handleUpdateStock(product.id, product.stock + 50)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    +50 unidades
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'low', label: 'Stock Bajo' },
            { value: 'out', label: 'Sin Stock' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {filteredProducts.length} productos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Stock Actual</th>
                <th className="px-6 py-3">Umbral</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map(product => {
                const status = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{product.name}</td>
                    <td className="table-cell text-gray-500">{product.sku}</td>
                    <td className="table-cell">
                      <span className="badge badge-info">{product.productType}</span>
                    </td>
                    <td className="table-cell">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="0"
                      />
                    </td>
                    <td className="table-cell text-gray-500">{product.lowStockThreshold}</td>
                    <td className="table-cell">
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStock(product.id, product.stock + 10)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleUpdateStock(product.id, Math.max(0, product.stock - 10))}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          -10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
