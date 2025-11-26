import { useState, useEffect } from 'react';
import { itService } from '../../services';
import { IntegrationStatus } from '../../models';

export const Integrations = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoading(true);
      try {
        const data = await itService.getIntegrationStatus();
        setIntegrations(data);
      } catch (err) {
        console.error('Error loading integrations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadIntegrations();
  }, []);

  const handleTestConnection = async (name: string) => {
    setTestingIntegration(name);
    try {
      const result = await itService.testConnection(name);
      alert(result.success
        ? `Conexión exitosa! Tiempo de respuesta: ${result.responseTime}ms`
        : 'Error en la conexión');
    } catch {
      alert('Error al probar la conexión');
    } finally {
      setTestingIntegration(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONNECTED: 'badge-success',
      DISCONNECTED: 'badge-danger',
      ERROR: 'badge-warning',
    };
    const labels: Record<string, string> = {
      CONNECTED: 'Conectado',
      DISCONNECTED: 'Desconectado',
      ERROR: 'Error',
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{labels[status] || status}</span>;
  };

  const getProviderBadge = (type: string) => {
    const styles: Record<string, string> = {
      REST: 'bg-blue-100 text-blue-800',
      SOAP: 'bg-purple-100 text-purple-800',
      GRPC: 'bg-green-100 text-green-800',
    };
    return <span className={`badge ${styles[type] || 'badge-info'}`}>{type}</span>;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
          <p className="text-gray-500">Estado de conexiones con proveedores externos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <p className="stat-label">Integraciones Activas</p>
          <p className="stat-value text-green-600">
            {integrations.filter(i => i.status === 'CONNECTED').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Tasa de Éxito Promedio</p>
          <p className="stat-value">
            {(integrations.reduce((sum, i) => sum + i.successRate, 0) / integrations.length).toFixed(1)}%
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Tiempo Respuesta Promedio</p>
          <p className="stat-value">
            {Math.round(integrations.reduce((sum, i) => sum + i.avgResponseTime, 0) / integrations.length)}ms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map(integration => (
          <div key={integration.name} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  {getProviderBadge(integration.type)}
                </div>
                <p className="text-sm text-gray-500">{integration.endpoint}</p>
              </div>
              {getStatusBadge(integration.status)}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Tasa de éxito</p>
                <p className={`font-semibold ${integration.successRate >= 95 ? 'text-green-600' : integration.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {integration.successRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tiempo respuesta</p>
                <p className="font-semibold">{integration.avgResponseTime}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última sincronización</p>
                <p className="font-semibold text-sm">
                  {new Date(integration.lastSync).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleTestConnection(integration.name)}
                disabled={testingIntegration === integration.name}
                className="btn-secondary text-sm flex-1"
              >
                {testingIntegration === integration.name ? 'Probando...' : 'Probar Conexión'}
              </button>
              <button className="btn-primary text-sm flex-1">
                Sincronizar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
