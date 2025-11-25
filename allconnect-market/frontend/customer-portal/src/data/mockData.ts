import { User, Customer, Address, Category, Product, Order, OrderItem, Invoice, Notification } from '../models';

// Test Users (matching init-databases.sql)
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'cliente@test.com',
    firstName: 'Juan',
    lastName: 'Cliente',
    role: 'CUSTOMER',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-11-24T10:00:00Z'
  },
  {
    id: 2,
    email: 'cliente2@test.com',
    firstName: 'Maria',
    lastName: 'Compradora',
    role: 'CUSTOMER',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 3,
    email: 'admin.negocio@test.com',
    firstName: 'Carlos',
    lastName: 'Negocio',
    role: 'ADMIN_NEGOCIO',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    email: 'admin.contenido@test.com',
    firstName: 'Ana',
    lastName: 'Contenido',
    role: 'ADMIN_CONTENIDO',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    email: 'admin.it@test.com',
    firstName: 'Pedro',
    lastName: 'TI',
    role: 'ADMIN_IT',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 6,
    email: 'admin.operaciones@test.com',
    firstName: 'Laura',
    lastName: 'Operaciones',
    role: 'ADMIN_OPERACIONES',
    enabled: true,
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Customers
export const mockCustomers: Customer[] = [
  {
    id: 1,
    userId: 1,
    email: 'cliente@test.com',
    firstName: 'Juan',
    lastName: 'Cliente',
    phone: '+506 8888-1111',
    dateOfBirth: '1990-05-15',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    email: 'cliente2@test.com',
    firstName: 'Maria',
    lastName: 'Compradora',
    phone: '+506 8888-2222',
    dateOfBirth: '1985-08-22',
    createdAt: '2024-01-05T00:00:00Z'
  }
];

// Addresses
export const mockAddresses: Address[] = [
  {
    id: 1,
    customerId: 1,
    label: 'Casa',
    street: 'Calle Principal 123',
    streetAddress: 'Calle Principal 123',
    city: 'San José',
    state: 'San José',
    postalCode: '10101',
    country: 'Costa Rica',
    isDefault: true
  },
  {
    id: 2,
    customerId: 1,
    label: 'Oficina',
    street: 'Avenida Central 456',
    streetAddress: 'Avenida Central 456',
    city: 'San José',
    state: 'San José',
    postalCode: '10102',
    country: 'Costa Rica',
    isDefault: false
  },
  {
    id: 3,
    customerId: 2,
    label: 'Casa',
    street: 'Barrio Los Ángeles 789',
    streetAddress: 'Barrio Los Ángeles 789',
    city: 'Heredia',
    state: 'Heredia',
    postalCode: '40101',
    country: 'Costa Rica',
    isDefault: true
  }
];

// Categories
export const mockCategories: Category[] = [
  { id: 1, name: 'Electrónica', description: 'Productos electrónicos y gadgets', imageUrl: '/images/categories/electronics.jpg', isActive: true, sortOrder: 1 },
  { id: 2, name: 'Ropa y Accesorios', description: 'Moda y complementos', imageUrl: '/images/categories/clothing.jpg', isActive: true, sortOrder: 2 },
  { id: 3, name: 'Salud y Bienestar', description: 'Servicios de salud y bienestar', imageUrl: '/images/categories/health.jpg', isActive: true, sortOrder: 3 },
  { id: 4, name: 'Servicios Profesionales', description: 'Consultorías y asesorías', imageUrl: '/images/categories/services.jpg', isActive: true, sortOrder: 4 },
  { id: 5, name: 'Entretenimiento Digital', description: 'Streaming y contenido digital', imageUrl: '/images/categories/entertainment.jpg', isActive: true, sortOrder: 5 },
  { id: 6, name: 'Educación', description: 'Cursos y contenido educativo', imageUrl: '/images/categories/education.jpg', isActive: true, sortOrder: 6 },
  { id: 7, name: 'Hogar y Jardín', description: 'Productos para el hogar', imageUrl: '/images/categories/home.jpg', isActive: true, sortOrder: 7 },
  { id: 8, name: 'Deportes', description: 'Artículos deportivos y fitness', imageUrl: '/images/categories/sports.jpg', isActive: true, sortOrder: 8 }
];

// Products - matching exactly the SQL data
export const mockProducts: Product[] = [
  // PHYSICAL Products (REST Provider)
  {
    id: 1,
    sku: 'ELEC-LAPTOP-001',
    name: 'Laptop Gaming XPS 15',
    description: 'Laptop de alto rendimiento para gaming y trabajo profesional. Procesador Intel Core i9, 32GB RAM, 1TB SSD NVMe, NVIDIA RTX 4070. Pantalla 15.6" 4K OLED. Incluye garantía de 2 años.',
    shortDescription: 'Laptop gaming de alto rendimiento con RTX 4070',
    price: 1299.99,
    compareAtPrice: 1499.99,
    productType: 'PHYSICAL',
    categoryId: 1,
    providerType: 'REST',
    providerProductId: 'REST-001',
    stock: 50,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.8,
    ratingCount: 127,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    sku: 'ELEC-PHONE-001',
    name: 'Smartphone Galaxy S24 Ultra',
    description: 'El smartphone más avanzado de Samsung. Pantalla Dynamic AMOLED 6.8", 200MP cámara, S Pen incluido, 512GB almacenamiento, 12GB RAM. Batería de 5000mAh con carga rápida 45W.',
    shortDescription: 'Smartphone Samsung flagship con S Pen',
    price: 899.99,
    compareAtPrice: 999.99,
    productType: 'PHYSICAL',
    categoryId: 1,
    providerType: 'REST',
    providerProductId: 'REST-002',
    stock: 100,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.7,
    ratingCount: 89,
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    sku: 'ELEC-AUDIO-001',
    name: 'Audífonos Bluetooth Pro ANC',
    description: 'Audífonos inalámbricos premium con cancelación activa de ruido. 40 horas de batería, audio Hi-Res, Bluetooth 5.3. Estuche de carga incluido.',
    shortDescription: 'Audífonos con cancelación de ruido premium',
    price: 199.99,
    compareAtPrice: 249.99,
    productType: 'PHYSICAL',
    categoryId: 1,
    providerType: 'REST',
    providerProductId: 'REST-003',
    stock: 200,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.6,
    ratingCount: 234,
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: 4,
    sku: 'ELEC-WATCH-001',
    name: 'Smartwatch Pro Series 8',
    description: 'Reloj inteligente con monitoreo de salud avanzado. GPS integrado, resistente al agua 50m, batería de 7 días. Compatible con iOS y Android.',
    shortDescription: 'Smartwatch con GPS y monitor de salud',
    price: 349.99,
    compareAtPrice: 399.99,
    productType: 'PHYSICAL',
    categoryId: 1,
    providerType: 'REST',
    providerProductId: 'REST-004',
    stock: 75,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.5,
    ratingCount: 156,
    createdAt: '2024-01-04T00:00:00Z'
  },
  {
    id: 5,
    sku: 'CLOTH-JACKET-001',
    name: 'Chaqueta Impermeable Adventure',
    description: 'Chaqueta técnica impermeable y transpirable. Ideal para senderismo y actividades outdoor. Capucha ajustable, múltiples bolsillos.',
    shortDescription: 'Chaqueta impermeable para outdoor',
    price: 129.99,
    compareAtPrice: 159.99,
    productType: 'PHYSICAL',
    categoryId: 2,
    providerType: 'REST',
    providerProductId: 'REST-005',
    stock: 120,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.4,
    ratingCount: 67,
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: 6,
    sku: 'HOME-COFFEE-001',
    name: 'Cafetera Espresso Automática',
    description: 'Máquina de espresso con molinillo integrado. 15 bares de presión, vaporizador de leche, pantalla táctil. Prepara cappuccino y latte automáticamente.',
    shortDescription: 'Cafetera espresso con molinillo integrado',
    price: 449.99,
    compareAtPrice: 549.99,
    productType: 'PHYSICAL',
    categoryId: 7,
    providerType: 'REST',
    providerProductId: 'REST-006',
    stock: 40,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.9,
    ratingCount: 203,
    createdAt: '2024-01-06T00:00:00Z'
  },
  // SERVICE Products (SOAP Provider)
  {
    id: 7,
    sku: 'SERV-MED-001',
    name: 'Consulta Médica General',
    description: 'Consulta presencial con médico general certificado. Duración 30 minutos. Incluye receta digital y seguimiento por 7 días. Clínica ubicada en San José centro.',
    shortDescription: 'Consulta con médico general - 30 min',
    price: 50.00,
    productType: 'SERVICE',
    categoryId: 3,
    providerType: 'SOAP',
    providerProductId: 'SOAP-001',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.8,
    ratingCount: 312,
    createdAt: '2024-01-07T00:00:00Z'
  },
  {
    id: 8,
    sku: 'SERV-LEGAL-001',
    name: 'Asesoría Legal 1 Hora',
    description: 'Consulta con abogado especializado en derecho civil y mercantil. Revisión de documentos, contratos, consultas generales. Asesoría presencial o virtual.',
    shortDescription: 'Asesoría legal especializada - 1 hora',
    price: 150.00,
    productType: 'SERVICE',
    categoryId: 4,
    providerType: 'SOAP',
    providerProductId: 'SOAP-002',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.6,
    ratingCount: 89,
    createdAt: '2024-01-08T00:00:00Z'
  },
  {
    id: 9,
    sku: 'SERV-YOGA-001',
    name: 'Clase de Yoga Personal',
    description: 'Sesión privada de yoga con instructor certificado. 1 hora de duración. Adaptada a tu nivel y objetivos. Incluye esterilla y accesorios.',
    shortDescription: 'Clase privada de yoga - 1 hora',
    price: 35.00,
    productType: 'SERVICE',
    categoryId: 3,
    providerType: 'SOAP',
    providerProductId: 'SOAP-003',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.9,
    ratingCount: 178,
    createdAt: '2024-01-09T00:00:00Z'
  },
  {
    id: 10,
    sku: 'SERV-NUTRI-001',
    name: 'Consulta Nutricional',
    description: 'Evaluación nutricional completa con nutricionista certificado. Plan alimenticio personalizado, seguimiento mensual incluido.',
    shortDescription: 'Consulta nutricional con plan personalizado',
    price: 75.00,
    productType: 'SERVICE',
    categoryId: 3,
    providerType: 'SOAP',
    providerProductId: 'SOAP-004',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.7,
    ratingCount: 145,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 11,
    sku: 'SERV-PHOTO-001',
    name: 'Sesión Fotográfica Profesional',
    description: 'Sesión de fotos de 2 horas con fotógrafo profesional. Incluye 20 fotos editadas en alta resolución. Ideal para retratos, eventos o productos.',
    shortDescription: 'Sesión fotográfica 2 horas + 20 fotos',
    price: 120.00,
    productType: 'SERVICE',
    categoryId: 4,
    providerType: 'SOAP',
    providerProductId: 'SOAP-005',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.8,
    ratingCount: 67,
    createdAt: '2024-01-11T00:00:00Z'
  },
  {
    id: 12,
    sku: 'SERV-MASSAGE-001',
    name: 'Masaje Terapéutico',
    description: 'Masaje terapéutico de cuerpo completo con terapeuta certificado. 60 minutos. Técnicas de relajación y alivio de tensión muscular.',
    shortDescription: 'Masaje terapéutico completo - 60 min',
    price: 65.00,
    productType: 'SERVICE',
    categoryId: 3,
    providerType: 'SOAP',
    providerProductId: 'SOAP-006',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.9,
    ratingCount: 234,
    createdAt: '2024-01-12T00:00:00Z'
  },
  // SUBSCRIPTION Products (gRPC Provider)
  {
    id: 13,
    sku: 'SUBS-STREAM-001',
    name: 'Plan Streaming Premium',
    description: 'Acceso ilimitado a películas, series y documentales. Calidad 4K HDR, hasta 4 pantallas simultáneas. Contenido nuevo cada semana. Sin anuncios.',
    shortDescription: 'Streaming ilimitado 4K - 4 pantallas',
    price: 14.99,
    productType: 'SUBSCRIPTION',
    categoryId: 5,
    providerType: 'GRPC',
    providerProductId: 'GRPC-001',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500',
    attributes: { billing_cycle: 'monthly', screens: 4, quality: '4K HDR' },
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.7,
    ratingCount: 1523,
    createdAt: '2024-01-13T00:00:00Z'
  },
  {
    id: 14,
    sku: 'SUBS-SOFT-001',
    name: 'Software Productividad Pro',
    description: 'Suite completa de herramientas de productividad. Incluye procesador de texto, hojas de cálculo, presentaciones, almacenamiento en la nube 1TB.',
    shortDescription: 'Suite productividad + 1TB nube',
    price: 9.99,
    productType: 'SUBSCRIPTION',
    categoryId: 5,
    providerType: 'GRPC',
    providerProductId: 'GRPC-002',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
    attributes: { billing_cycle: 'monthly', storage: '1TB', apps: ['docs', 'sheets', 'slides'] },
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.5,
    ratingCount: 892,
    createdAt: '2024-01-14T00:00:00Z'
  },
  {
    id: 15,
    sku: 'SUBS-EDU-001',
    name: 'Contenido Educativo Ilimitado',
    description: 'Acceso a más de 5000 cursos en línea. Certificados incluidos, aprendizaje a tu ritmo. Categorías: tecnología, negocios, idiomas, diseño.',
    shortDescription: 'Acceso ilimitado a cursos online',
    price: 19.99,
    productType: 'SUBSCRIPTION',
    categoryId: 6,
    providerType: 'GRPC',
    providerProductId: 'GRPC-003',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500',
    attributes: { billing_cycle: 'monthly', courses: '5000+', certificates: true },
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.8,
    ratingCount: 678,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 16,
    sku: 'SUBS-MUSIC-001',
    name: 'Música Premium Sin Anuncios',
    description: 'Streaming de música sin límites ni anuncios. Más de 80 millones de canciones, podcasts exclusivos, descarga offline, audio lossless.',
    shortDescription: 'Música ilimitada sin anuncios',
    price: 9.99,
    productType: 'SUBSCRIPTION',
    categoryId: 5,
    providerType: 'GRPC',
    providerProductId: 'GRPC-004',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
    attributes: { billing_cycle: 'monthly', songs: '80M+', offline: true },
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.6,
    ratingCount: 2341,
    createdAt: '2024-01-16T00:00:00Z'
  },
  {
    id: 17,
    sku: 'SUBS-FITNESS-001',
    name: 'App Fitness Premium',
    description: 'Planes de entrenamiento personalizados, seguimiento de progreso, nutrición. Acceso a clases en vivo y biblioteca de ejercicios.',
    shortDescription: 'Fitness personalizado + clases en vivo',
    price: 12.99,
    productType: 'SUBSCRIPTION',
    categoryId: 3,
    providerType: 'GRPC',
    providerProductId: 'GRPC-005',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
    attributes: { billing_cycle: 'monthly', live_classes: true, personal_trainer: 'AI' },
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.4,
    ratingCount: 456,
    createdAt: '2024-01-17T00:00:00Z'
  },
  {
    id: 18,
    sku: 'SUBS-NEWS-001',
    name: 'Noticias Premium Digital',
    description: 'Acceso ilimitado a noticias premium de los principales medios. Sin anuncios, newsletters exclusivos, archivo histórico completo.',
    shortDescription: 'Noticias premium sin anuncios',
    price: 7.99,
    productType: 'SUBSCRIPTION',
    categoryId: 5,
    providerType: 'GRPC',
    providerProductId: 'GRPC-006',
    stock: 999,
    lowStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500',
    attributes: { billing_cycle: 'monthly', sources: '50+', archive: 'unlimited' },
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.3,
    ratingCount: 234,
    createdAt: '2024-01-18T00:00:00Z'
  }
];

// Sample Orders
export const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-2024-0001',
    customerId: 1,
    status: 'DELIVERED',
    orderType: 'PHYSICAL',
    subtotal: 1299.99,
    tax: 169.00,
    shippingCost: 15.00,
    discount: 0,
    total: 1483.99,
    currency: 'USD',
    shippingAddress: mockAddresses[0],
    items: [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        productSku: 'ELEC-LAPTOP-001',
        productName: 'Laptop Gaming XPS 15',
        productType: 'PHYSICAL',
        quantity: 1,
        unitPrice: 1299.99,
        price: 1299.99,
        totalPrice: 1299.99,
        providerType: 'REST',
        status: 'CONFIRMED'
      }
    ],
    statusHistory: [
      { id: 1, orderId: 1, status: 'PENDING', comment: 'Orden creada', createdAt: '2024-01-15T10:00:00Z' },
      { id: 2, orderId: 1, status: 'CONFIRMED', comment: 'Pago confirmado', createdAt: '2024-01-15T10:05:00Z' },
      { id: 3, orderId: 1, status: 'PROCESSING', comment: 'Preparando envío', createdAt: '2024-01-15T14:00:00Z' },
      { id: 4, orderId: 1, status: 'SHIPPED', comment: 'Enviado con tracking: CR123456789', createdAt: '2024-01-16T09:00:00Z' },
      { id: 5, orderId: 1, status: 'DELIVERED', comment: 'Entregado al cliente', createdAt: '2024-01-18T15:30:00Z' }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T15:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-0002',
    customerId: 1,
    status: 'CONFIRMED',
    orderType: 'SERVICE',
    subtotal: 50.00,
    tax: 6.50,
    shippingCost: 0,
    discount: 0,
    total: 56.50,
    currency: 'USD',
    items: [
      {
        id: 2,
        orderId: 2,
        productId: 7,
        productSku: 'SERV-MED-001',
        productName: 'Consulta Médica General',
        productType: 'SERVICE',
        quantity: 1,
        unitPrice: 50.00,
        price: 50.00,
        totalPrice: 50.00,
        providerType: 'SOAP',
        reservationDate: '2024-02-01T10:00:00Z',
        reservationCode: 'MED-2024-001',
        status: 'CONFIRMED'
      }
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:05:00Z'
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-0003',
    customerId: 2,
    status: 'PROCESSING',
    orderType: 'SUBSCRIPTION',
    subtotal: 14.99,
    tax: 1.95,
    shippingCost: 0,
    discount: 0,
    total: 16.94,
    currency: 'USD',
    items: [
      {
        id: 3,
        orderId: 3,
        productId: 13,
        productSku: 'SUBS-STREAM-001',
        productName: 'Plan Streaming Premium',
        productType: 'SUBSCRIPTION',
        quantity: 1,
        unitPrice: 14.99,
        price: 14.99,
        totalPrice: 14.99,
        providerType: 'GRPC',
        subscriptionStart: '2024-01-25',
        subscriptionEnd: '2024-02-25',
        status: 'CONFIRMED'
      }
    ],
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:05:00Z'
  }
];

// Sample Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-0001',
    orderId: 1,
    customerId: 1,
    customerName: 'Juan Cliente',
    subtotal: 1299.99,
    taxRate: 13.00,
    taxAmount: 169.00,
    discount: 0,
    total: 1483.99,
    status: 'PAID',
    issuedDate: '2024-01-15',
    paidDate: '2024-01-15'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-0002',
    orderId: 2,
    customerId: 1,
    customerName: 'Juan Cliente',
    subtotal: 50.00,
    taxRate: 13.00,
    taxAmount: 6.50,
    discount: 0,
    total: 56.50,
    status: 'PAID',
    issuedDate: '2024-01-20',
    paidDate: '2024-01-20'
  }
];

// Sample Notifications
export const mockNotifications: Notification[] = [
  {
    id: 1,
    notificationId: 'NOTIF-001',
    customerId: 1,
    channel: 'EMAIL',
    subject: 'Bienvenido a AllConnect Market',
    body: 'Hola Juan, Bienvenido a AllConnect Market. Tu cuenta ha sido creada exitosamente.',
    status: 'DELIVERED',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    notificationId: 'NOTIF-002',
    customerId: 1,
    channel: 'EMAIL',
    subject: 'Tu orden #ORD-2024-0001 ha sido confirmada',
    body: 'Hola Juan, Tu orden ha sido confirmada y está siendo procesada.',
    status: 'DELIVERED',
    createdAt: '2024-01-15T10:05:00Z'
  },
  {
    id: 3,
    notificationId: 'NOTIF-003',
    customerId: 1,
    channel: 'EMAIL',
    subject: 'Tu pedido ha sido enviado',
    body: 'Hola Juan, Tu pedido está en camino. Tracking: CR123456789',
    status: 'DELIVERED',
    createdAt: '2024-01-16T09:00:00Z'
  }
];

// Trending product IDs (for recommendations)
export const trendingProductIds = [1, 2, 13, 7, 4];

// Helper functions
export const getProductById = (id: number): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductsByType = (type: string): Product[] => {
  return mockProducts.filter(p => p.productType === type && p.isActive);
};

export const getFeaturedProducts = (): Product[] => {
  return mockProducts.filter(p => p.isFeatured && p.isActive);
};

export const getTrendingProducts = (): Product[] => {
  return trendingProductIds.map(id => getProductById(id)!).filter(Boolean);
};

export const getCategoryById = (id: number): Category | undefined => {
  return mockCategories.find(c => c.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(u => u.email === email);
};

export const getCustomerByUserId = (userId: number): Customer | undefined => {
  return mockCustomers.find(c => c.userId === userId);
};

export const getAddressesByCustomerId = (customerId: number): Address[] => {
  return mockAddresses.filter(a => a.customerId === customerId);
};

export const getOrdersByCustomerId = (customerId: number): Order[] => {
  return mockOrders.filter(o => o.customerId === customerId);
};
