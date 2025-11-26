import { useState, useEffect } from 'react';
import { itService } from '../../services';
import { SystemMetrics as SystemMetricsType } from '../../models';

export const Metrics = () => {
  const [metrics, setMetrics] = useState<SystemMetricsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await itService.getSystemMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error loading metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();

    // Refresh every 10 seconds
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading || !metrics) {
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
          <h1 className="text-2xl font-bold text-gray-900">Métricas del Sistema</h1>
          <p className="text-gray-500">Monitoreo de recursos en tiempo real</p>
        </div>
        <div className="text-sm text-gray-500">
          Actualización automática cada 10s
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="stat-label">CPU</p>
            <p className={`text-2xl font-bold ${getUsageColor(metrics.cpuUsage)}`}>
              {metrics.cpuUsage}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getUsageBarColor(metrics.cpuUsage)}`}
              style={{ width: `${metrics.cpuUsage}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="stat-label">Memoria</p>
            <p className={`text-2xl font-bold ${getUsageColor(metrics.memoryUsage)}`}>
              {metrics.memoryUsage}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getUsageBarColor(metrics.memoryUsage)}`}
              style={{ width: `${metrics.memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="stat-label">Disco</p>
            <p className={`text-2xl font-bold ${getUsageColor(metrics.diskUsage)}`}>
              {metrics.diskUsage}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getUsageBarColor(metrics.diskUsage)}`}
              style={{ width: `${metrics.diskUsage}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <p className="stat-label">Conexiones Activas</p>
          <p className="stat-value">{metrics.activeConnections}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Requests por minuto</p>
                <p className="text-sm text-gray-500">Promedio últimos 5 minutos</p>
              </div>
              <p className="text-2xl font-bold text-primary-600">{metrics.requestsPerMinute}</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Latencia promedio</p>
                <p className="text-sm text-gray-500">Tiempo de respuesta</p>
              </div>
              <p className="text-2xl font-bold text-green-600">45ms</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Tasa de errores</p>
                <p className="text-sm text-gray-500">Últimas 24 horas</p>
              </div>
              <p className="text-2xl font-bold text-green-600">0.02%</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Estado por Servicio</h3>
          <div className="space-y-3">
            {['Gateway', 'Order Service', 'Catalog Service', 'Customer Service', 'Integration Service'].map(service => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">{service}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.floor(Math.random() * 50) + 20}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
