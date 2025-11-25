import { useState, useEffect } from 'react';
import { contenidoService } from '../../services';
import { ContentItem, Product } from '../../models';

export const DashboardContenido = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [contentData, productsData] = await Promise.all([
          contenidoService.getContentItems(),
          contenidoService.getProducts(),
        ]);
        setContentItems(contentData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleActive = async (id: string) => {
    const item = contentItems.find(c => c.id === id);
    if (!item) return;

    try {
      await contenidoService.updateContentItem(id, { isActive: !item.isActive });
      setContentItems(items =>
        items.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i)
      );
    } catch (err) {
      console.error('Error toggling content:', err);
    }
  };

  const toggleProductFeatured = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      await contenidoService.toggleProductFeatured(productId, !product.isFeatured);
      setProducts(prods =>
        prods.map(p => p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p)
      );
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      BANNER: 'badge-info',
      PROMOTION: 'badge-success',
      PAGE: 'badge-warning',
    };
    return <span className={`badge ${styles[type] || 'badge-info'}`}>{type}</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  const featuredProducts = products.filter(p => p.isFeatured);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Banners Activos</p>
          <p className="stat-value">{contentItems.filter(c => c.type === 'BANNER' && c.isActive).length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Promociones</p>
          <p className="stat-value">{contentItems.filter(c => c.type === 'PROMOTION').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Productos Destacados</p>
          <p className="stat-value">{featuredProducts.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Categorías</p>
          <p className="stat-value">8</p>
        </div>
      </div>

      {/* Content Management */}
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Gestión de Contenido</h3>
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            + Nuevo Contenido
          </button>
        </div>

        <div className="divide-y">
          {contentItems.map(item => (
            <div key={item.id} className="px-6 py-4">
              <div className="flex items-center gap-6">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    {getTypeBadge(item.type)}
                  </div>
                  <p className="text-sm text-gray-500">{item.content}</p>
                  {item.startDate && item.endDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={() => toggleActive(item.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Productos Destacados</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map(product => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">${product.price}</span>
                <button
                  onClick={() => toggleProductFeatured(product.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Quitar destacado
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Preview */}
      <div className="card">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Categorías</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Gestionar
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Electrónica', 'Ropa', 'Salud', 'Servicios', 'Entretenimiento', 'Educación', 'Hogar', 'Deportes'].map((cat, i) => (
            <div key={i} className="border rounded-lg p-4 text-center hover:border-primary-500 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="font-medium text-sm">{cat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedItem ? 'Editar Contenido' : 'Nuevo Contenido'}
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select className="input-field" defaultValue={selectedItem?.type || 'BANNER'}>
                  <option value="BANNER">Banner</option>
                  <option value="PROMOTION">Promoción</option>
                  <option value="PAGE">Página</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" className="input-field" defaultValue={selectedItem?.title || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea className="input-field" rows={3} defaultValue={selectedItem?.content || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input type="url" className="input-field" defaultValue={selectedItem?.imageUrl || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                  <input type="date" className="input-field" defaultValue={selectedItem?.startDate || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                  <input type="date" className="input-field" defaultValue={selectedItem?.endDate || ''} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContenido;
