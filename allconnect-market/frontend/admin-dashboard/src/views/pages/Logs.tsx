import { useState, useEffect } from 'react';
import { itService } from '../../services';
import { EventLog } from '../../models';

export const Logs = () => {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const data = await itService.getEventLogs();
        setLogs(data);
      } catch (err) {
        console.error('Error loading logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      INFO: 'badge-info',
      WARN: 'badge-warning',
      ERROR: 'badge-danger',
    };
    return <span className={`badge ${styles[severity] || 'badge-info'}`}>{severity}</span>;
  };

  const services = [...new Set(logs.map(l => l.service))];

  const filteredLogs = logs.filter(log => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (serviceFilter !== 'all' && log.service !== serviceFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs del Sistema</h1>
          <p className="text-gray-500">Registro de eventos y errores</p>
        </div>
        <button className="btn-secondary">↓ Exportar Logs</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Total Eventos</p>
          <p className="stat-value">{logs.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Información</p>
          <p className="stat-value text-blue-600">{logs.filter(l => l.severity === 'INFO').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Advertencias</p>
          <p className="stat-value text-yellow-600">{logs.filter(l => l.severity === 'WARN').length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Errores</p>
          <p className="stat-value text-red-600">{logs.filter(l => l.severity === 'ERROR').length}</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Todas las severidades</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Todos los servicios</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {filteredLogs.length} eventos encontrados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Severidad</th>
                <th className="px-6 py-3">Servicio</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono text-sm">
              {filteredLogs.map(log => (
                <tr key={log.id} className={`hover:bg-gray-50 ${log.severity === 'ERROR' ? 'bg-red-50' : log.severity === 'WARN' ? 'bg-yellow-50' : ''}`}>
                  <td className="table-cell text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="table-cell">{getSeverityBadge(log.severity)}</td>
                  <td className="table-cell">{log.service}</td>
                  <td className="table-cell text-gray-600">{log.eventType}</td>
                  <td className="table-cell max-w-md truncate" title={log.message}>
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
