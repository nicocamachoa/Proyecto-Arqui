import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../viewmodels';
import { Order } from '../../models';

export const MySubscriptions = () => {
  const { subscriptionOrders, isLoading } = useOrders();
  const [selectedSubscription, setSelectedSubscription] = useState<Order | null>(null);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAUSED: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Activa',
      PENDING: 'Pendiente',
      PAUSED: 'Pausada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Suscripciones</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subscriptionOrders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg
          className="w-24 h-24 text-gray-300 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No tienes suscripciones</h2>
        <p className="text-gray-500 mb-8">
          Cuando te suscribas a un servicio digital, aparecerá aquí
        </p>
        <Link to="/catalog?type=SUBSCRIPTION" className="btn-primary">
          Explorar Suscripciones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Suscripciones</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscriptions List */}
        <div className="lg:col-span-2 space-y-4">
          {subscriptionOrders.map((subscription) => (
            <div
              key={subscription.id}
              className={`card p-6 cursor-pointer transition-all ${
                selectedSubscription?.id === subscription.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedSubscription(subscription)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {subscription.items[0]?.product?.name || subscription.items[0]?.productName || 'Suscripción'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Plan mensual
                    </span>
                  </div>
                </div>
                {getStatusBadge(subscription.status === 'CONFIRMED' ? 'ACTIVE' : subscription.status)}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Inicio: {new Date(subscription.createdAt).toLocaleDateString('es-ES')}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${subscription.items[0]?.price?.toFixed(2) || '0.00'}/mes
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Próxima renovación</span>
                  <span className="text-sm font-medium">
                    {new Date(new Date(subscription.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Detail */}
        <div className="lg:col-span-1">
          {selectedSubscription ? (
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Detalle de Suscripción</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Servicio</span>
                  <p className="font-medium">
                    {selectedSubscription.items[0]?.product?.name || selectedSubscription.items[0]?.productName || 'Suscripción'}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Estado</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedSubscription.status === 'CONFIRMED' ? 'ACTIVE' : selectedSubscription.status)}
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Plan</span>
                  <p className="font-medium">Mensual</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Precio</span>
                  <p className="font-medium text-2xl">
                    ${selectedSubscription.items[0]?.price?.toFixed(2) || '0.00'}
                    <span className="text-sm text-gray-500 font-normal">/mes</span>
                  </p>
                </div>

                <hr />

                <div>
                  <span className="text-sm text-gray-500">Fecha de inicio</span>
                  <p className="font-medium">
                    {new Date(selectedSubscription.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Próxima facturación</span>
                  <p className="font-medium">
                    {new Date(new Date(selectedSubscription.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {selectedSubscription.status === 'CONFIRMED' && (
                  <div className="pt-4 space-y-2">
                    <button className="btn-primary w-full">
                      Acceder al Servicio
                    </button>
                    <button className="btn-secondary w-full">
                      Pausar Suscripción
                    </button>
                    <button className="w-full py-2 text-red-600 hover:text-red-700 text-sm font-medium">
                      Cancelar Suscripción
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p>Selecciona una suscripción para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;
