import { useState, useEffect } from 'react';
import { itService } from '../../services';
import { ServiceHealth, SystemMetrics, EventLog, IntegrationStatus } from '../../models';

export const DashboardIT = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'integrations' | 'logs' | 'metrics'>('services');
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [servicesData, metricsData, logsData, integrationsData] = await Promise.all([
          itService.getServiceHealth(),
          itService.getSystemMetrics(),
          itService.getEventLogs(),
          itService.getIntegrationStatus(),
        ]);
        setServices(servicesData);
        setMetrics(metricsData);
        setLogs(logsData);
        setIntegrations(integrationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [servicesData, metricsData] = await Promise.all([
        itService.getServiceHealth(),
        itService.getSystemMetrics(),
      ]);
      setServices(servicesData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (name: string) => {
    try {
      const result = await itService.testConnection(name);
      alert(`Conexión exitosa! Tiempo de respuesta: ${result.responseTime}ms`);
    } catch (err) {
      alert('Error al probar conexión');
    }
  };

  const forceSync = async (name: string) => {
    try {
      await itService.forceSync(name);
      alert('Sincronización iniciada');
    } catch (err) {
      alert('Error al forzar sincronización');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      UP: 'badge-success',
      CONNECTED: 'badge-success',
      DOWN: 'badge-danger',
      DISCONNECTED: 'badge-danger',
      DEGRADED: 'badge-warning',
      ERROR: 'badge-danger',
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{status}</span>;
  };

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      INFO: 'badge-info',
      WARN: 'badge-warning',
      ERROR: 'badge-danger',
    };
    return <span className={`badge ${styles[severity] || 'badge-info'}`}>{severity}</span>;
  };

  if (isLoading && !metrics) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
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

  if (!metrics) return null;

  const upServices = services.filter(s => s.status === 'UP').length;
  const totalServices = services.length;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="stat-card">
          <p className="stat-label">Servicios Activos</p>
          <p className="stat-value text-green-600">{upServices}/{totalServices}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">CPU</p>
          <p className="stat-value">{metrics.cpuUsage}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div className={`h-2 rounded-full ${metrics.cpuUsage > 80 ? 'bg-red-500' : metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metrics.cpuUsage}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Memoria</p>
          <p className="stat-value">{metrics.memoryUsage}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div className={`h-2 rounded-full ${metrics.memoryUsage > 80 ? 'bg-red-500' : metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metrics.memoryUsage}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Conexiones</p>
          <p className="stat-value">{metrics.activeConnections}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Req/min</p>
          <p className="stat-value">{metrics.requestsPerMinute}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {[
          { key: 'services', label: 'Servicios' },
          { key: 'integrations', label: 'Integraciones' },
          { key: 'logs', label: 'Event Logs' },
          { key: 'metrics', label: 'Métricas' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Estado de Servicios</h3>
            <button onClick={refreshData} className="btn-secondary text-sm">
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3">Servicio</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Tiempo de Respuesta</th>
                  <th className="px-6 py-3">Última Verificación</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map((service, index) => (
                  <tr key={index}>
                    <td className="table-cell font-medium">{service.name}</td>
                    <td className="table-cell">{getStatusBadge(service.status)}</td>
                    <td className="table-cell">
                      <span className={service.responseTime > 200 ? 'text-red-600' : service.responseTime > 100 ? 'text-yellow-600' : 'text-green-600'}>
                        {service.responseTime}ms
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {new Date(service.lastCheck).toLocaleTimeString()}
                    </td>
                    <td className="table-cell">
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {integrations.map((integration, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    integration.type === 'REST' ? 'bg-blue-100' :
                    integration.type === 'SOAP' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <span className={`font-bold text-sm ${
                      integration.type === 'REST' ? 'text-blue-600' :
                      integration.type === 'SOAP' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {integration.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-500">{integration.endpoint}</p>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Tasa de Éxito</p>
                  <p className="text-lg font-semibold">{integration.successRate}%</p>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${integration.successRate}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tiempo de Respuesta</p>
                  <p className="text-lg font-semibold">{integration.avgResponseTime}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Última Sincronización</p>
                  <p className="text-lg font-semibold">
                    {new Date(integration.lastSync).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => testConnection(integration.name)} className="btn-secondary text-sm">Test Conexión</button>
                <button onClick={() => forceSync(integration.name)} className="btn-secondary text-sm">Forzar Sync</button>
                <button className="btn-secondary text-sm">Ver Logs</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Event Logs</h3>
            <div className="flex gap-2">
              <select className="input-field py-1 text-sm">
                <option>Todos los servicios</option>
                <option>Order Service</option>
                <option>Payment Service</option>
                <option>Integration Service</option>
              </select>
              <select className="input-field py-1 text-sm">
                <option>Todas las severidades</option>
                <option>INFO</option>
                <option>WARN</option>
                <option>ERROR</option>
              </select>
            </div>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(log.severity)}
                    <span className="font-medium text-sm">{log.eventType}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{log.message}</p>
                <p className="text-xs text-gray-400 mt-1">{log.service}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Uso de Recursos</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU</span>
                  <span>{metrics.cpuUsage}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full">
                  <div className={`h-4 rounded-full ${metrics.cpuUsage > 80 ? 'bg-red-500' : metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metrics.cpuUsage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memoria</span>
                  <span>{metrics.memoryUsage}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full">
                  <div className={`h-4 rounded-full ${metrics.memoryUsage > 80 ? 'bg-red-500' : metrics.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metrics.memoryUsage}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disco</span>
                  <span>{metrics.diskUsage}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full">
                  <div className="h-4 bg-blue-500 rounded-full" style={{ width: `${metrics.diskUsage}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Métricas de Red</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">{metrics.activeConnections}</p>
                <p className="text-sm text-gray-500 mt-1">Conexiones Activas</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">{metrics.requestsPerMinute}</p>
                <p className="text-sm text-gray-500 mt-1">Requests/min</p>
              </div>
            </div>
          </div>

          <div className="card p-6 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Tiempo de Respuesta por Servicio</h3>
            <div className="flex items-end gap-4 h-48">
              {services.slice(0, 8).map((service, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${
                      service.responseTime > 200 ? 'bg-red-500' :
                      service.responseTime > 100 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ height: `${(service.responseTime / 250) * 150}px` }}
                  />
                  <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                    {service.name.split(' ')[0]}
                  </span>
                  <span className="text-xs font-medium">{service.responseTime}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardIT;
