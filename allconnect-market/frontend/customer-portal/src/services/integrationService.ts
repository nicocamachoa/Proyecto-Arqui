import api, { USE_MOCK } from './api';
import { Product, PaginatedResponse, ProductFilters } from '../models';
import {
  mockProducts,
  getProductById as getMockProductById,
  getFeaturedProducts,
} from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Map integration provider product to frontend Product model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProviderProduct = (p: any, index: number): Product => {
  // Generate numeric ID from string ID (e.g., "PROD001" -> 1001)
  let numericId = index + 1;
  if (typeof p.id === 'string') {
    const match = p.id.match(/\d+/);
    if (match) {
      if (p.id.startsWith('PROD')) numericId = 1000 + parseInt(match[0]);
      else if (p.id.startsWith('SVC')) numericId = 2000 + parseInt(match[0]);
      else if (p.id.startsWith('SUB')) numericId = 3000 + parseInt(match[0]);
    }
  } else {
    numericId = p.id;
  }

  // Determine category ID based on category name
  let categoryId = 1;
  const categoryMap: Record<string, number> = {
    'Electronics': 1,
    'Audio': 2,
    'Peripherals': 3,
    'Medical': 4,
    'Legal': 5,
    'Fitness': 6,
    'Education': 7,
    'Streaming': 8,
    'Software': 9,
    'Gaming': 10,
  };
  if (p.category && categoryMap[p.category]) {
    categoryId = categoryMap[p.category];
  }

  // Generate a placeholder image URL if the current one is just example.com
  let imageUrl = p.imageUrl;
  if (!imageUrl || imageUrl.includes('example.com')) {
    const productName = encodeURIComponent(String(p.name || 'Product').substring(0, 20));
    const colors = ['6366f1', '8b5cf6', 'ec4899', 'f59e0b', '10b981', '3b82f6'];
    const colorIndex = numericId % colors.length;
    imageUrl = `https://placehold.co/400x400/${colors[colorIndex]}/ffffff?text=${productName}`;
  }

  return {
    id: numericId,
    sku: p.id || `SKU-${numericId}`,
    name: p.name,
    description: p.description,
    shortDescription: p.description?.substring(0, 100),
    price: p.price,
    compareAtPrice: undefined,
    productType: p.productType || 'PHYSICAL',
    categoryId: categoryId,
    category: p.category ? { id: categoryId, name: p.category, isActive: true, sortOrder: 0 } : undefined,
    providerType: p.providerType || 'REST',
    providerProductId: p.id,
    stock: p.stock || 999,
    lowStockThreshold: 5,
    imageUrl: imageUrl,
    galleryUrls: [],
    attributes: p.durationMinutes ? { duration: `${p.durationMinutes} min`, provider: p.providerName } : {},
    tags: [],
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.0 + Math.random(),
    ratingCount: Math.floor(Math.random() * 100) + 10,
    createdAt: new Date().toISOString(),
  };
};

export const integrationService = {
  /**
   * Get all products from external providers via integration service
   */
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    if (USE_MOCK) {
      await delay(300);
      let products = [...mockProducts].filter(p => p.isActive);

      // Apply filters (simplified for mock)
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
        );
      }

      if (filters?.productType) {
        products = products.filter(p => p.productType === filters.productType);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const start = (page - 1) * limit;

      return {
        data: products.slice(start, start + limit),
        total: products.length,
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
      };
    }

    try {
      // Fetch from integration service (aggregates from all providers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>('/integration/products');
      const data = response.data;

      let products: Product[] = (data.products || []).map((p: unknown, idx: number) => mapProviderProduct(p, idx));

      // Apply client-side filters
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
        );
      }

      if (filters?.productType) {
        products = products.filter(p => p.productType === filters.productType);
      }

      if (filters?.providerType) {
        products = products.filter(p => p.providerType === filters.providerType);
      }

      if (filters?.minPrice !== undefined) {
        products = products.filter(p => p.price >= filters.minPrice!);
      }

      if (filters?.maxPrice !== undefined) {
        products = products.filter(p => p.price <= filters.maxPrice!);
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'name':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'price':
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.ratingAverage - a.ratingAverage);
          break;
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const start = (page - 1) * limit;
      const paginatedProducts = products.slice(start, start + limit);

      return {
        data: paginatedProducts,
        total: products.length,
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
      };
    } catch (error) {
      console.error('Error fetching from integration service:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
      };
    }
  },

  /**
   * Get a single product by its provider ID
   */
  getProductById: async (productId: string): Promise<Product | null> => {
    if (USE_MOCK) {
      await delay(200);
      const numId = parseInt(productId.replace(/\D/g, '')) || 1;
      return getMockProductById(numId) ?? null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`/integration/products/${productId}`);
      if (response.data && Object.keys(response.data).length > 0) {
        return mapProviderProduct(response.data, 0);
      }
      return null;
    } catch (error) {
      console.error('Error fetching product from integration service:', error);
      return null;
    }
  },

  /**
   * Get featured products from providers
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return getFeaturedProducts();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>('/integration/products');
      const products = (response.data.products || []).map((p: unknown, idx: number) => mapProviderProduct(p, idx));
      // Return first 4 as featured
      return products.slice(0, 4);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  /**
   * Get products by type (PHYSICAL, SERVICE, DIGITAL)
   */
  getProductsByType: async (type: string): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return mockProducts.filter(p => p.productType === type && p.isActive);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>('/integration/products');
      const products = (response.data.products || []).map((p: unknown, idx: number) => mapProviderProduct(p, idx));
      return products.filter((p: Product) => p.productType === type);
    } catch (error) {
      console.error('Error fetching products by type:', error);
      return [];
    }
  },

  /**
   * Search products across all providers
   */
  searchProducts: async (query: string): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(300);
      const search = query.toLowerCase();
      return mockProducts.filter(p =>
        p.isActive && (
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
        )
      ).slice(0, 10);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>('/integration/products');
      const products = (response.data.products || []).map((p: unknown, idx: number) => mapProviderProduct(p, idx));
      const search = query.toLowerCase();
      return products.filter((p: Product) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      ).slice(0, 10);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },
};

export default integrationService;
