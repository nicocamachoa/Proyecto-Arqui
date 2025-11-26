import { useState, useEffect } from 'react';
import { contenidoService } from '../../services';
import { ContentItem } from '../../models';

export const Content = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const data = await contenidoService.getContentItems();
        setItems(data);
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      BANNER: 'badge-info',
      PROMOTION: 'badge-success',
      PAGE: 'badge-warning',
    };
    return <span className={`badge ${styles[type] || 'badge-info'}`}>{type}</span>;
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter(i => i.type === filter);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h1>
          <p className="text-gray-500">Administra banners, páginas y contenido del sitio</p>
        </div>
        <button className="btn-primary">+ Nuevo Contenido</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'BANNER', 'PROMOTION', 'PAGE'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Todos' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="card overflow-hidden">
            {item.imageUrl && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                {getTypeBadge(item.type)}
              </div>
              {item.content && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.content}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className={item.isActive ? 'text-green-600' : 'text-gray-400'}>
                  {item.isActive ? '● Activo' : '○ Inactivo'}
                </span>
                <div className="flex gap-2">
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No se encontró contenido</p>
        </div>
      )}
    </div>
  );
};

export default Content;
