import { useState, useEffect } from 'react';
import { itService } from '../../services';
import { ServiceHealth } from '../../models';

export const Services = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const data = await itService.getServiceHealth();
        setServices(data);
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return <span className="w-3 h-3 bg-green-500 rounded-full"></span>;
      case 'DOWN':
        return <span className="w-3 h-3 bg-red-500 rounded-full"></span>;
      case 'DEGRADED':
        return <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>;
      default:
        return <span className="w-3 h-3 bg-gray-500 rounded-full"></span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UP: 'badge-success',
      DOWN: 'badge-danger',
      DEGRADED: 'badge-warning',
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{status}</span>;
  };

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

  const upServices = services.filter(s => s.status === 'UP').length;
  const downServices = services.filter(s => s.status === 'DOWN').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estado de Servicios</h1>
          <p className="text-gray-500">Monitoreo en tiempo real de microservicios</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          ↻ Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Total Servicios</p>
          <p className="stat-value">{services.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">En Línea</p>
          <p className="stat-value text-green-600">{upServices}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Fuera de Línea</p>
          <p className="stat-value text-red-600">{downServices}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Disponibilidad</p>
          <p className="stat-value">{((upServices / services.length) * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Todos los Servicios</h3>
        </div>
        <div className="divide-y">
          {services.map(service => (
            <div key={service.name} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    Última verificación: {new Date(service.lastCheck).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tiempo de respuesta</p>
                  <p className={`font-medium ${service.responseTime > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {service.responseTime}ms
                  </p>
                </div>
                {getStatusBadge(service.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
