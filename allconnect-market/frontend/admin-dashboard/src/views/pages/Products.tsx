import { useState, useEffect } from 'react';
import { negocioService } from '../../services';
import { Product } from '../../models';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await negocioService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      PHYSICAL: 'badge-info',
      SERVICE: 'badge-success',
      SUBSCRIPTION: 'badge-warning',
    };
    const labels: Record<string, string> = {
      PHYSICAL: 'Físico',
      SERVICE: 'Servicio',
      SUBSCRIPTION: 'Suscripción',
    };
    return <span className={`badge ${styles[type] || 'badge-info'}`}>{labels[type] || type}</span>;
  };

  const getProviderBadge = (provider: string) => {
    const styles: Record<string, string> = {
      REST: 'bg-blue-100 text-blue-800',
      SOAP: 'bg-purple-100 text-purple-800',
      GRPC: 'bg-green-100 text-green-800',
    };
    return <span className={`badge ${styles[provider] || 'badge-info'}`}>{provider}</span>;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-500">Productos disponibles de proveedores externos</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full max-w-md"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="card overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {getTypeBadge(product.productType)}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                </div>
                <p className="text-lg font-bold text-primary-600">${product.price}</p>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center gap-2">
                {getProviderBadge(product.providerType)}
                <span className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
};

export default Products;
