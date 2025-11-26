import api, { USE_MOCK } from './api';
import { Product, Category, ProductFilters, PaginatedResponse } from '../models';
import {
  mockProducts,
  mockCategories,
  getProductById as getMockProductById,
  getFeaturedProducts,
  getProductsByType
} from '../data/mockData';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Map backend product to frontend Product model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendProduct = (p: any): Product => ({
  id: p.id,
  sku: p.sku || '',
  name: p.name,
  description: p.description,
  shortDescription: p.description?.substring(0, 100),
  price: p.price,
  compareAtPrice: undefined,
  productType: p.type || p.productType,
  categoryId: p.categoryId,
  category: p.categoryName ? { id: p.categoryId, name: p.categoryName, isActive: true, sortOrder: 0 } : undefined,
  providerType: p.providerType,
  providerProductId: p.providerProductId,
  stock: p.stock,
  lowStockThreshold: 5,
  imageUrl: p.imageUrl || `https://placehold.co/300x300/e2e8f0/475569?text=${encodeURIComponent(p.name?.substring(0, 15) || 'Product')}`,
  galleryUrls: [],
  attributes: {},
  tags: [],
  isActive: p.active !== undefined ? p.active : true,
  isFeatured: false,
  ratingAverage: 4.5,
  ratingCount: Math.floor(Math.random() * 100),
  createdAt: p.createdAt,
});

export const catalogService = {
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    if (USE_MOCK) {
      await delay(300);

      let products = [...mockProducts].filter(p => p.isActive);

      // Apply filters
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.shortDescription?.toLowerCase().includes(search)
        );
      }

      if (filters?.categoryId) {
        const catId = parseInt(filters.categoryId, 10);
        products = products.filter(p => p.categoryId === catId);
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

      if (filters?.inStock) {
        products = products.filter(p => p.stock > 0);
      }

      if (filters?.isFeatured) {
        products = products.filter(p => p.isFeatured);
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
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
          products.sort((a, b) => b.ratingCount - a.ratingCount);
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
    }

    // Get all products from catalog service (includes provider products)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any[]>('/catalog/products/all');
    let products: Product[] = (response.data || []).map(mapBackendProduct);

    // Apply client-side filters
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    if (filters?.categoryId) {
      const catId = parseInt(filters.categoryId, 10);
      products = products.filter(p => p.categoryId === catId);
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
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Apply pagination
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
  },

  getProductById: async (id: number): Promise<Product> => {
    if (USE_MOCK) {
      await delay(200);

      const product = getMockProductById(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>(`/catalog/products/${id}`);
    return mapBackendProduct(response.data);
  },

  getCategories: async (): Promise<Category[]> => {
    if (USE_MOCK) {
      await delay(200);
      return mockCategories.filter(c => c.isActive);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any[]>('/catalog/categories');
      // Map backend format to frontend format
      return response.data.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        parentId: c.parentId,
        imageUrl: c.imageUrl,
        isActive: c.active !== undefined ? c.active : true,
        sortOrder: c.sortOrder || 0,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getCategoryById: async (id: number): Promise<Category> => {
    if (USE_MOCK) {
      await delay(100);
      const category = mockCategories.find(c => c.id === id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
      return category;
    }

    const response = await api.get<Category>(`/catalog/categories/${id}`);
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return getFeaturedProducts();
    }

    try {
      // Get all products including provider products
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any[]>('/catalog/products/all');
      const products = response.data || [];
      // Return first 4 as "featured"
      return products.slice(0, 4).map(mapBackendProduct);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  getProductsByType: async (type: string): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return getProductsByType(type);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>(`/catalog/products/type/${type}`);
    const products = Array.isArray(response.data) ? response.data : (response.data.content || []);
    return products.map(mapBackendProduct);
  },

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>('/catalog/products/search', { params: { q: query } });
    const products = Array.isArray(response.data) ? response.data : (response.data.content || []);
    return products.map(mapBackendProduct);
  },

  checkStock: async (productId: number): Promise<{ available: boolean; stock: number }> => {
    if (USE_MOCK) {
      await delay(100);
      const product = getMockProductById(productId);
      return {
        available: product ? product.stock > 0 : false,
        stock: product?.stock || 0,
      };
    }

    const response = await api.get<{ available: boolean; stock: number }>(`/catalog/products/${productId}/stock`);
    return response.data;
  },
};

export default catalogService;
