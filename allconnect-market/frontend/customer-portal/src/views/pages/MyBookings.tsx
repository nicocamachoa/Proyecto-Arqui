import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../viewmodels';
import { Order } from '../../models';

export const MyBookings = () => {
  const { serviceOrders, isLoading } = useOrders();
  const [selectedBooking, setSelectedBooking] = useState<Order | null>(null);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_PROGRESS: 'En curso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Reservas</h1>
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

  if (serviceOrders.length === 0) {
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No tienes reservas</h2>
        <p className="text-gray-500 mb-8">
          Cuando reserves un servicio, aparecerá aquí
        </p>
        <Link to="/catalog?type=SERVICE" className="btn-primary">
          Explorar Servicios
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Reservas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          {serviceOrders.map((booking) => (
            <div
              key={booking.id}
              className={`card p-6 cursor-pointer transition-all ${
                selectedBooking?.id === booking.id ? 'ring-2 ring-primary-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {booking.items[0]?.product?.name || booking.items[0]?.productName || 'Servicio'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Reserva #{booking.orderNumber || String(booking.id).padStart(8, '0')}
                    </span>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(booking.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  10:00 AM
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-gray-500">Total pagado</span>
                <span className="font-semibold text-lg">${booking.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Detail */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Detalle de la Reserva</h2>

              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Servicio</span>
                  <p className="font-medium">
                    {selectedBooking.items[0]?.product?.name || selectedBooking.items[0]?.productName || 'Servicio'}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Estado</span>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Fecha y Hora</span>
                  <p className="font-medium">
                    {new Date(selectedBooking.createdAt).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    <br />
                    10:00 AM
                  </p>
                </div>

                <hr />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedBooking.total.toFixed(2)}</span>
                </div>

                {selectedBooking.status === 'CONFIRMED' && (
                  <div className="pt-4 space-y-2">
                    <button className="btn-primary w-full">
                      Ver Instrucciones
                    </button>
                    <button className="btn-secondary w-full text-red-600 hover:text-red-700">
                      Cancelar Reserva
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'DELIVERED' && (
                  <div className="pt-4">
                    <button className="btn-secondary w-full">
                      Dejar Reseña
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Selecciona una reserva para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
