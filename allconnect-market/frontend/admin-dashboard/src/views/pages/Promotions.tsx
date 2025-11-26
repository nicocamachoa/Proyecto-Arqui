import { useState, useEffect } from 'react';
import { contenidoService } from '../../services';
import { ContentItem } from '../../models';

export const Promotions = () => {
  const [promotions, setPromotions] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPromotions = async () => {
      setIsLoading(true);
      try {
        const data = await contenidoService.getContentItems();
        setPromotions(data.filter(item => item.type === 'PROMOTION'));
      } catch (err) {
        console.error('Error loading promotions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPromotions();
  }, []);

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Promociones</h1>
          <p className="text-gray-500">Crea y administra promociones y ofertas especiales</p>
        </div>
        <button className="btn-primary">+ Nueva Promoción</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="stat-label">Promociones Activas</p>
          <p className="stat-value">{promotions.filter(p => p.isActive).length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Próximas a Vencer</p>
          <p className="stat-value text-yellow-600">2</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Promociones</p>
          <p className="stat-value">{promotions.length}</p>
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Todas las Promociones</h3>
        </div>
        <div className="divide-y">
          {promotions.map(promo => (
            <div key={promo.id} className="p-6 flex items-center gap-4">
              {promo.imageUrl && (
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{promo.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{promo.content}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  {promo.startDate && (
                    <span className="text-gray-500">
                      Inicio: {new Date(promo.startDate).toLocaleDateString()}
                    </span>
                  )}
                  {promo.endDate && (
                    <span className="text-gray-500">
                      Fin: {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${promo.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {promo.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {promotions.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No hay promociones configuradas</p>
        </div>
      )}
    </div>
  );
};

export default Promotions;
