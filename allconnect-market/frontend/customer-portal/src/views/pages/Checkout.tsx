import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useOrders } from '../../viewmodels';
import { useAuthStore } from '../../stores';
import { customerService } from '../../services';
import { Address } from '../../models';

type Step = 'shipping' | 'payment' | 'review';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { createOrder, isLoading } = useOrders();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<{
    items: typeof items;
    subtotal: number;
    tax: number;
    total: number;
  } | null>(null);

  // Saved addresses from backend
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [shippingData, setShippingData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  // Load saved addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (user?.id) {
        try {
          const addresses = await customerService.getAddresses(user.id);
          setSavedAddresses(addresses);
          // Auto-select default address
          const defaultAddr = addresses.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
          } else {
            setUseNewAddress(true);
          }
        } catch (err) {
          console.error('Error loading addresses:', err);
          setUseNewAddress(true);
        } finally {
          setLoadingAddresses(false);
        }
      } else {
        setLoadingAddresses(false);
        setUseNewAddress(true);
      }
    };
    loadAddresses();
  }, [user?.id]);

  const hasPhysicalProducts = items.some(i => i.product.productType === 'PHYSICAL');
  const hasServices = items.some(i => i.product.productType === 'SERVICE');
  const hasSubscriptions = items.some(i => i.product.productType === 'SUBSCRIPTION');

  // Skip shipping step if no physical products
  useEffect(() => {
    if (!hasPhysicalProducts && currentStep === 'shipping') {
      setCurrentStep('payment');
    }
  }, [hasPhysicalProducts, currentStep]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    // Set processing flag FIRST to prevent any redirect
    setIsProcessingOrder(true);

    // Save order data BEFORE any async operations
    const orderData = { items: [...items], subtotal, tax, total };

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productType: item.product.productType,
        quantity: item.quantity,
        unitPrice: item.product.price,
      }));

      // Get shipping address from selected saved address or new address
      let shippingAddress: Record<string, string> | undefined;
      if (hasPhysicalProducts) {
        if (!useNewAddress && selectedAddressId) {
          const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
          if (selectedAddr) {
            shippingAddress = {
              address: selectedAddr.street,
              city: selectedAddr.city,
              state: selectedAddr.state || '',
              zipCode: selectedAddr.zipCode || '',
            };
          }
        } else {
          shippingAddress = shippingData;
        }
      }

      const order = await createOrder({
        items: orderItems,
        shippingAddress,
        paymentMethod: 'CREDIT_CARD',
      });

      // Set ALL success states synchronously before clearing cart
      setCompletedOrderData(orderData);
      setOrderId(order.id);
      setOrderComplete(true);

      // Clear cart after state is set
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessingOrder(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-600">
            Pedido #{orderId ? String(orderId).padStart(8, '0') : ''} procesado exitosamente
          </p>
        </div>

        {/* Order Summary */}
        {completedOrderData && (
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Resumen de tu Compra</h2>

            <div className="space-y-3 mb-4">
              {completedOrderData.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <img
                    src={item.product.imageUrl || 'https://placehold.co/64x64?text=Producto'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Producto';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.product.productType === 'PHYSICAL' && 'Producto físico'}
                      {item.product.productType === 'SERVICE' && 'Servicio'}
                      {item.product.productType === 'SUBSCRIPTION' && 'Suscripción'}
                      {' · '}Cantidad: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${completedOrderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IVA (13%)</span>
                <span>${completedOrderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total Pagado</span>
                <span className="text-green-600">${completedOrderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-800 font-medium">Confirmación enviada</p>
              <p className="text-blue-600 text-sm">
                Recibirás un correo electrónico con los detalles de tu pedido y seguimiento de envío.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 text-center">
          {completedOrderData?.items.some(i => i.product.productType === 'PHYSICAL') && (
            <button
              onClick={() => navigate('/my-orders')}
              className="btn-primary w-full py-3"
            >
              Ver Mis Pedidos
            </button>
          )}
          {completedOrderData?.items.some(i => i.product.productType === 'SERVICE') && (
            <button
              onClick={() => navigate('/my-bookings')}
              className="btn-secondary w-full py-3"
            >
              Ver Mis Reservas
            </button>
          )}
          {completedOrderData?.items.some(i => i.product.productType === 'SUBSCRIPTION') && (
            <button
              onClick={() => navigate('/my-subscriptions')}
              className="btn-secondary w-full py-3"
            >
              Ver Mis Suscripciones
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 font-medium block w-full py-2"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    );
  }

  // Only redirect to cart if we haven't started/completed an order
  // isProcessingOrder prevents redirect during order creation
  if (items.length === 0 && !orderComplete && !completedOrderData && !orderId && !isProcessingOrder) {
    navigate('/cart');
    return null;
  }

  const steps = [
    { id: 'shipping', label: 'Envío', show: hasPhysicalProducts },
    { id: 'payment', label: 'Pago', show: true },
    { id: 'review', label: 'Revisar', show: true },
  ].filter(s => s.show);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep === step.id
                  ? 'bg-primary-600 text-white'
                  : steps.findIndex(s => s.id === currentStep) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {steps.findIndex(s => s.id === currentStep) > index ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={`ml-2 ${currentStep === step.id ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-16 h-1 mx-4 bg-gray-200">
                <div
                  className={`h-full bg-green-500 transition-all ${
                    steps.findIndex(s => s.id === currentStep) > index ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-2">
          {/* Shipping Form */}
          {currentStep === 'shipping' && hasPhysicalProducts && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Dirección de Envío</h2>

              {loadingAddresses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando direcciones...</p>
                </div>
              ) : (
                <>
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && !useNewAddress && (
                    <div className="space-y-3 mb-6">
                      <p className="text-sm font-medium text-gray-700">Direcciones guardadas:</p>
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === addr.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{addr.street}</p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} {addr.zipCode}
                              </p>
                              <p className="text-sm text-gray-500">{addr.country}</p>
                              {addr.isDefault && (
                                <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                  Por defecto
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(true)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        + Agregar nueva dirección
                      </button>
                    </div>
                  )}

                  {/* New Address Form */}
                  {(useNewAddress || savedAddresses.length === 0) && (
                    <form onSubmit={handleShippingSubmit}>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setUseNewAddress(false)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
                        >
                          ← Usar dirección guardada
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                          <input
                            type="text"
                            required
                            value={shippingData.firstName}
                            onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                          <input
                            type="text"
                            required
                            value={shippingData.lastName}
                            onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                          <input
                            type="text"
                            required
                            value={shippingData.address}
                            onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                            className="input-field"
                            placeholder="Calle, número, apartamento..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                          <input
                            type="text"
                            required
                            value={shippingData.city}
                            onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estado/Provincia</label>
                          <input
                            type="text"
                            required
                            value={shippingData.state}
                            onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                          <input
                            type="text"
                            required
                            value={shippingData.zipCode}
                            onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                          <input
                            type="tel"
                            required
                            value={shippingData.phone}
                            onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn-primary w-full mt-6 py-3">
                        Continuar al Pago
                      </button>
                    </form>
                  )}

                  {/* Continue button for saved address */}
                  {!useNewAddress && savedAddresses.length > 0 && (
                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="btn-primary w-full mt-6 py-3"
                    >
                      Continuar al Pago
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Payment Form */}
          {currentStep === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Información de Pago</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    required
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    className="input-field"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    required
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                    className="input-field"
                    placeholder="JUAN PEREZ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                    <input
                      type="text"
                      required
                      value={paymentData.expiry}
                      onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                      className="input-field"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      required
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                      className="input-field"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                {hasPhysicalProducts && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep('shipping')}
                    className="btn-secondary flex-1 py-3"
                  >
                    Volver
                  </button>
                )}
                <button type="submit" className="btn-primary flex-1 py-3">
                  Revisar Pedido
                </button>
              </div>
            </form>
          )}

          {/* Review */}
          {currentStep === 'review' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Revisar Pedido</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <img
                      src={item.product.imageUrl || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Producto';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <span className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              {hasPhysicalProducts && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-medium mb-2">Dirección de Envío</h3>
                  {!useNewAddress && selectedAddressId ? (
                    (() => {
                      const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
                      return selectedAddr ? (
                        <p className="text-gray-600 text-sm">
                          {selectedAddr.street}<br />
                          {selectedAddr.city}, {selectedAddr.state} {selectedAddr.zipCode}<br />
                          {selectedAddr.country}
                        </p>
                      ) : null;
                    })()
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {shippingData.firstName} {shippingData.lastName}<br />
                      {shippingData.address}<br />
                      {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
                      Tel: {shippingData.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Info */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Método de Pago</h3>
                <p className="text-gray-600 text-sm">
                  Tarjeta terminada en {paymentData.cardNumber.slice(-4)}
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setCurrentStep('payment')}
                  className="btn-secondary flex-1 py-3"
                >
                  Volver
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="btn-primary flex-1 py-3"
                >
                  {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IVA (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {hasPhysicalProducts && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pago 100% seguro
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Garantía de satisfacción
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
