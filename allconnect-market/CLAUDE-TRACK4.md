# Track 4: Frontend MVVM + Demo End-to-End

## TU MISIÓN

Eres responsable de las interfaces de usuario y de que TODO el sistema funcione de punta a punta. Tu trabajo es lo que el usuario final ve - y lo que se presenta en la demo.

**Lee primero**: CLAUDE.md y TRACKS_DIVISION.md

---

## CHECKLIST DE TAREAS

Actualiza este checklist frecuentemente marcando con [x] lo completado:

### Fase 1: Setup y Estructura (Horas 0-1)

#### Customer Portal (puerto 3000)
- [ ] Create React App o Vite
- [ ] Estructura MVVM configurada
- [ ] React Router configurado
- [ ] Zustand para estado global
- [ ] Axios configurado para API calls
- [ ] Tailwind CSS o Material UI

#### Admin Dashboard (puerto 3010)
- [ ] Create React App o Vite
- [ ] Estructura MVVM configurada
- [ ] React Router configurado
- [ ] Zustand para estado global

#### Estructura MVVM
```
src/
├── models/          # Tipos e interfaces TypeScript
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   └── ...
├── viewmodels/      # Custom hooks con lógica
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useCart.ts
│   └── ...
├── views/           # Componentes de UI
│   ├── pages/
│   └── components/
├── services/        # API calls
│   ├── api.ts
│   ├── authService.ts
│   └── ...
└── stores/          # Zustand stores
    ├── authStore.ts
    ├── cartStore.ts
    └── ...
```

### Fase 2: Customer Portal - Autenticación (Horas 1-2.5)

#### Páginas
- [ ] /login - Página de login
- [ ] /register - Página de registro
- [ ] Redirección post-login

#### Componentes
- [ ] LoginForm
- [ ] RegisterForm
- [ ] AuthGuard (protected routes)

#### ViewModel: useAuth
```typescript
// viewmodels/useAuth.ts
export const useAuth = () => {
    const { user, token, setUser, setToken, logout } = useAuthStore();

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
    };

    const register = async (userData: RegisterDTO) => {
        const response = await authService.register(userData);
        // Auto-login después de registro
        await login(userData.email, userData.password);
    };

    return { user, token, login, register, logout, isAuthenticated: !!token };
};
```

#### Verificación
- [ ] Puedo registrar un nuevo usuario
- [ ] Puedo hacer login con usuario existente
- [ ] Token se guarda en localStorage
- [ ] Rutas protegidas funcionan

### Fase 3: Customer Portal - Catálogo (Horas 2.5-4.5)

#### Páginas
- [ ] /home - Home con recomendaciones
- [ ] /catalog - Catálogo completo
- [ ] /catalog?type=PHYSICAL - Productos físicos
- [ ] /catalog?type=SERVICE - Servicios
- [ ] /catalog?type=SUBSCRIPTION - Suscripciones
- [ ] /product/:id - Detalle de producto

#### Componentes
- [ ] ProductCard
- [ ] ProductGrid
- [ ] ProductFilters (tipo, categoría, precio)
- [ ] SearchBar
- [ ] ProductDetail
- [ ] RecommendationCarousel

#### ViewModel: useProducts
```typescript
export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({});

    const fetchProducts = async (newFilters?: ProductFilters) => {
        setLoading(true);
        const data = await catalogService.getProducts(newFilters || filters);
        setProducts(data);
        setLoading(false);
    };

    const getProductById = async (id: string) => {
        return await catalogService.getProduct(id);
    };

    return { products, loading, filters, setFilters, fetchProducts, getProductById };
};
```

#### ViewModel: useRecommendations
```typescript
export const useRecommendations = () => {
    const { user } = useAuthStore();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [trending, setTrending] = useState<Product[]>([]);

    const fetchRecommendations = async () => {
        if (user) {
            const data = await recommendationService.getForUser(user.id);
            setRecommendations(data);
        }
        const trendingData = await recommendationService.getTrending();
        setTrending(trendingData);
    };

    return { recommendations, trending, fetchRecommendations };
};
```

#### Verificación
- [ ] Home muestra recomendaciones para usuario logueado
- [ ] Catálogo muestra todos los productos
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda funciona
- [ ] Detalle de producto muestra info completa

### Fase 4: Customer Portal - Carrito y Checkout (Horas 4.5-7)

#### Páginas
- [ ] /cart - Carrito de compras
- [ ] /checkout - Proceso de checkout
- [ ] /checkout/success - Confirmación de orden

#### Componentes
- [ ] CartItem
- [ ] CartSummary
- [ ] CheckoutForm
- [ ] PaymentForm (mock)
- [ ] AddressSelector
- [ ] OrderConfirmation

#### ViewModel: useCart
```typescript
export const useCart = () => {
    const { items, addItem, removeItem, updateQuantity, clear } = useCartStore();

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount, addItem, removeItem, updateQuantity, clear };
};
```

#### ViewModel: useCheckout
```typescript
export const useCheckout = () => {
    const { items, clear } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);

    const placeOrder = async (paymentInfo: PaymentDTO, addressId: string) => {
        setLoading(true);
        try {
            const orderData = {
                items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                paymentInfo,
                addressId
            };
            const response = await orderService.create(orderData);
            setOrder(response);
            clear(); // Limpiar carrito
            return response;
        } finally {
            setLoading(false);
        }
    };

    return { loading, order, placeOrder };
};
```

#### Verificación
- [ ] Puedo agregar productos al carrito
- [ ] Carrito persiste (localStorage)
- [ ] Puedo completar checkout
- [ ] Recibo confirmación de orden
- [ ] Email de confirmación llega a MailDev

### Fase 5: Customer Portal - Mis Pedidos/Reservas/Suscripciones (Horas 7-9)

#### Páginas
- [ ] /my-orders - Lista de pedidos (productos físicos)
- [ ] /my-orders/:id - Detalle y tracking
- [ ] /my-bookings - Lista de reservas (servicios)
- [ ] /my-bookings/:id - Detalle de reserva
- [ ] /my-subscriptions - Suscripciones activas
- [ ] /my-subscriptions/:id - Detalle y acceso
- [ ] /profile - Perfil de usuario

#### Componentes
- [ ] OrderCard
- [ ] OrderDetail
- [ ] TrackingTimeline (para productos físicos)
- [ ] BookingCard
- [ ] BookingDetail
- [ ] SubscriptionCard
- [ ] SubscriptionAccess (botón para acceder al contenido)
- [ ] ProfileForm

#### ViewModel: useOrders
```typescript
export const useOrders = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = async () => {
        const data = await orderService.getByCustomer(user.id);
        setOrders(data);
    };

    const getOrderStatus = async (orderId: string) => {
        return await orderService.getStatus(orderId);
    };

    const cancelOrder = async (orderId: string) => {
        await orderService.cancel(orderId);
        fetchOrders(); // Refresh
    };

    return { orders, fetchOrders, getOrderStatus, cancelOrder };
};
```

#### Verificación
- [ ] Puedo ver mis pedidos de productos físicos
- [ ] Puedo ver tracking de envío
- [ ] Puedo ver mis reservas de servicios
- [ ] Puedo ver mis suscripciones activas
- [ ] Puedo cancelar una orden/reserva
- [ ] Puedo acceder al contenido de suscripción

### Fase 6: Admin Dashboard (Horas 9-11)

#### Páginas Comunes
- [ ] /admin/login - Login de admin
- [ ] /admin/select-view - Seleccionar tipo de admin
- [ ] /admin/dashboard - Dashboard según tipo

#### Vista: Admin Negocio
- [ ] /admin/negocio/dashboard - KPIs y métricas de ventas
- [ ] /admin/negocio/sales - Reporte de ventas
- [ ] /admin/negocio/revenue - Ingresos por período
- [ ] /admin/negocio/promotions - Gestión de promociones

##### Componentes
- [ ] SalesChart
- [ ] RevenueChart
- [ ] TopProductsTable
- [ ] KPICards (ventas hoy, esta semana, este mes)

#### Vista: Admin Contenido
- [ ] /admin/contenido/products - CRUD de productos
- [ ] /admin/contenido/categories - Gestión de categorías
- [ ] /admin/contenido/providers - Configuración de proveedores

##### Componentes
- [ ] ProductTable
- [ ] ProductForm (crear/editar)
- [ ] CategoryManager
- [ ] ProviderConfig

#### Vista: Admin IT
- [ ] /admin/it/services - Estado de servicios
- [ ] /admin/it/metrics - Métricas del sistema
- [ ] /admin/it/logs - Logs centralizados
- [ ] /admin/it/integrations - Estado de integraciones

##### Componentes
- [ ] ServiceHealthGrid
- [ ] MetricsCharts (embed de Grafana o custom)
- [ ] LogViewer
- [ ] IntegrationStatus

#### Vista: Admin Operaciones
- [ ] /admin/operaciones/orders - Gestión de órdenes
- [ ] /admin/operaciones/fulfillment - Fulfillment
- [ ] /admin/operaciones/incidents - Incidencias
- [ ] /admin/operaciones/inventory - Inventario

##### Componentes
- [ ] OrderManagementTable
- [ ] FulfillmentQueue
- [ ] IncidentList
- [ ] InventoryTable

#### Verificación Admin
- [ ] Puedo hacer login como cada tipo de admin
- [ ] Cada admin ve solo su vista correspondiente
- [ ] Admin Negocio ve métricas de ventas
- [ ] Admin Contenido puede crear/editar productos
- [ ] Admin IT ve estado de servicios
- [ ] Admin Operaciones puede gestionar órdenes

### Fase 7: Demo End-to-End y Polish (Horas 11-12)

#### Demo Script: Flujo Cliente
- [ ] 1. Registrar nuevo usuario
- [ ] 2. Login
- [ ] 3. Ver recomendaciones en home
- [ ] 4. Navegar catálogo, filtrar por tipo
- [ ] 5. Ver detalle de producto físico
- [ ] 6. Agregar al carrito
- [ ] 7. Ver detalle de servicio
- [ ] 8. Agregar al carrito (reserva)
- [ ] 9. Ver detalle de suscripción
- [ ] 10. Agregar al carrito
- [ ] 11. Ir al carrito
- [ ] 12. Checkout completo
- [ ] 13. Ver confirmación
- [ ] 14. Ir a Mis Pedidos
- [ ] 15. Ver tracking de producto físico
- [ ] 16. Ver detalle de reserva
- [ ] 17. Acceder a suscripción
- [ ] 18. Cancelar una orden (probar compensación)

#### Demo Script: Flujo Admin
- [ ] 1. Login como admin.negocio@test.com
- [ ] 2. Ver dashboard de ventas
- [ ] 3. Logout
- [ ] 4. Login como admin.contenido@test.com
- [ ] 5. Crear nuevo producto
- [ ] 6. Logout
- [ ] 7. Login como admin.it@test.com
- [ ] 8. Ver estado de servicios en Eureka
- [ ] 9. Logout
- [ ] 10. Login como admin.operaciones@test.com
- [ ] 11. Ver órdenes pendientes
- [ ] 12. Marcar una como procesada

#### Polish
- [ ] Loading states en todas las páginas
- [ ] Error handling con mensajes amigables
- [ ] Responsive design básico
- [ ] Navegación intuitiva
- [ ] Estilos consistentes

---

## API SERVICE LAYER

```typescript
// services/api.ts
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

```typescript
// services/authService.ts
import api from './api';

export const authService = {
    login: (email: string, password: string) =>
        api.post('/security/login', { email, password }).then(r => r.data),

    register: (data: RegisterDTO) =>
        api.post('/security/register', data).then(r => r.data),

    validate: () =>
        api.get('/security/validate').then(r => r.data),

    me: () =>
        api.get('/security/me').then(r => r.data)
};
```

```typescript
// services/catalogService.ts
import api from './api';

export const catalogService = {
    getProducts: (filters?: ProductFilters) =>
        api.get('/catalog/products', { params: filters }).then(r => r.data),

    getProduct: (id: string) =>
        api.get(`/catalog/products/${id}`).then(r => r.data),

    getCategories: () =>
        api.get('/catalog/categories').then(r => r.data),

    // Admin
    createProduct: (data: ProductDTO) =>
        api.post('/catalog/products', data).then(r => r.data),

    updateProduct: (id: string, data: ProductDTO) =>
        api.put(`/catalog/products/${id}`, data).then(r => r.data)
};
```

---

## ZUSTAND STORES

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, token: null })
        }),
        { name: 'auth-storage' }
    )
);
```

```typescript
// stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION';
    imageUrl: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clear: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (item) => set((state) => {
                const existing = state.items.find(i => i.id === item.id);
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        )
                    };
                }
                return { items: [...state.items, { ...item, quantity: 1 }] };
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter(i => i.id !== id)
            })),
            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(i =>
                    i.id === id ? { ...i, quantity } : i
                )
            })),
            clear: () => set({ items: [] })
        }),
        { name: 'cart-storage' }
    )
);
```

---

## ROUTING

```typescript
// Customer Portal routes
const routes = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/catalog', element: <Catalog /> },
    { path: '/product/:id', element: <ProductDetail /> },
    { path: '/cart', element: <Cart /> },
    { path: '/checkout', element: <ProtectedRoute><Checkout /></ProtectedRoute> },
    { path: '/checkout/success', element: <ProtectedRoute><OrderSuccess /></ProtectedRoute> },
    { path: '/my-orders', element: <ProtectedRoute><MyOrders /></ProtectedRoute> },
    { path: '/my-orders/:id', element: <ProtectedRoute><OrderDetail /></ProtectedRoute> },
    { path: '/my-bookings', element: <ProtectedRoute><MyBookings /></ProtectedRoute> },
    { path: '/my-bookings/:id', element: <ProtectedRoute><BookingDetail /></ProtectedRoute> },
    { path: '/my-subscriptions', element: <ProtectedRoute><MySubscriptions /></ProtectedRoute> },
    { path: '/my-subscriptions/:id', element: <ProtectedRoute><SubscriptionDetail /></ProtectedRoute> },
    { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> }
];
```

```typescript
// Admin Dashboard routes
const adminRoutes = [
    { path: '/admin/login', element: <AdminLogin /> },
    { path: '/admin/select-view', element: <AdminProtected><SelectView /></AdminProtected> },
    // Negocio
    { path: '/admin/negocio/*', element: <AdminProtected role="ADMIN_NEGOCIO"><NegocioRoutes /></AdminProtected> },
    // Contenido
    { path: '/admin/contenido/*', element: <AdminProtected role="ADMIN_CONTENIDO"><ContenidoRoutes /></AdminProtected> },
    // IT
    { path: '/admin/it/*', element: <AdminProtected role="ADMIN_IT"><ITRoutes /></AdminProtected> },
    // Operaciones
    { path: '/admin/operaciones/*', element: <AdminProtected role="ADMIN_OPERACIONES"><OperacionesRoutes /></AdminProtected> }
];
```

---

## COMANDOS DE VERIFICACIÓN

```bash
# Iniciar Customer Portal
cd frontend/customer-portal && npm run dev

# Iniciar Admin Dashboard
cd frontend/admin-dashboard && npm run dev

# Verificar que el Gateway está corriendo
curl http://localhost:8080/actuator/health

# Verificar APIs
curl http://localhost:8080/api/catalog/products
curl http://localhost:8080/api/security/validate \
  -H "Authorization: Bearer <token>"
```

---

## PROBLEMAS COMUNES Y SOLUCIONES

### CORS Error
- Verificar que Gateway tiene CORS configurado
- Verificar que el origin del frontend está permitido

### 401 Unauthorized
- Verificar que el token está en localStorage
- Verificar que el interceptor de axios lo envía
- Verificar que el token no expiró

### API no responde
- Verificar que el Gateway está corriendo
- Verificar que el servicio destino está registrado en Eureka
- Verificar logs del Gateway

### Estado no persiste
- Verificar configuración de persist en Zustand
- Verificar localStorage en el navegador

---

## MÉTRICAS DE ÉXITO

Al finalizar tu track, debes poder decir SÍ a todas estas preguntas:

1. ¿Puedo registrar un usuario nuevo?
2. ¿Puedo hacer login y ver mi perfil?
3. ¿La home muestra recomendaciones personalizadas?
4. ¿Puedo ver el catálogo con los 3 tipos de productos?
5. ¿Los filtros funcionan correctamente?
6. ¿Puedo agregar productos al carrito?
7. ¿Puedo completar un checkout de producto físico?
8. ¿Puedo completar un checkout de servicio (reserva)?
9. ¿Puedo completar un checkout de suscripción?
10. ¿Puedo ver el tracking de mis pedidos?
11. ¿Puedo ver mis reservas y suscripciones?
12. ¿Puedo cancelar una orden?
13. ¿Admin puede loguearse y ver su vista específica?
14. ¿Admin Contenido puede crear productos?
15. ¿El flujo E2E completo funciona sin errores?

---

## NOTAS PARA COORDINACIÓN

**Dependes de TODOS los otros tracks:**
- Track 1: Gateway funcionando
- Track 2: Todas las APIs de negocio
- Track 3: Estados de integración

**Eres el VALIDADOR del sistema:**
- Si algo no funciona en el frontend, probablemente hay un bug en el backend
- Reporta inmediatamente si una API no funciona como esperabas
- Tu trabajo valida el trabajo de todos los demás

**PRIORIDAD**:
1. Login/Registro primero (sin esto no hay demo)
2. Catálogo y carrito segundo
3. Checkout tercero (flujo crítico)
4. Mis pedidos/reservas/suscripciones cuarto
5. Admin Dashboard último (menos crítico para demo)

**TÚ ERES LA CARA DEL PROYECTO. Lo que muestras es lo que se evalúa.**
