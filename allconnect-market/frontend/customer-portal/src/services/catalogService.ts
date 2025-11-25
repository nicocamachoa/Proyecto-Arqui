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

    const response = await api.get<PaginatedResponse<Product>>('/catalog/products', { params: filters });
    return response.data;
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

    const response = await api.get<Product>(`/catalog/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    if (USE_MOCK) {
      await delay(200);
      return mockCategories.filter(c => c.isActive);
    }

    const response = await api.get<Category[]>('/catalog/categories');
    return response.data;
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

    const response = await api.get<Product[]>('/catalog/products/featured');
    return response.data;
  },

  getProductsByType: async (type: string): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return getProductsByType(type);
    }

    const response = await api.get<Product[]>(`/catalog/products/type/${type}`);
    return response.data;
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

    const response = await api.get<Product[]>('/catalog/products/search', { params: { q: query } });
    return response.data;
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
