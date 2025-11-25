import api, { USE_MOCK } from './api';
import { Product, Recommendation } from '../models';
import { mockProducts, getTrendingProducts, getFeaturedProducts } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const recommendationService = {
  getForUser: async (userId: number): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(300);
      // Simulate personalized recommendations based on user
      // In mock mode, return a mix of products
      const featured = getFeaturedProducts();
      const trending = getTrendingProducts();

      // Combine and deduplicate
      const combined = [...featured, ...trending];
      const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());

      return unique.slice(0, 8);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>(`/recommendations/user/${userId}`);
      // Backend returns { products: [...] }
      const products = response.data.products || response.data || [];
      return products.map((p: Record<string, unknown>) => ({
        id: p.productId || p.id,
        sku: p.sku || '',
        name: p.name,
        description: p.description,
        shortDescription: p.description?.toString().substring(0, 100),
        price: p.price,
        productType: p.type || p.productType || 'PHYSICAL',
        categoryId: p.categoryId,
        providerType: 'REST',
        stock: 100,
        lowStockThreshold: 5,
        imageUrl: p.imageUrl || `https://placehold.co/300x300/e2e8f0/475569?text=${encodeURIComponent(String(p.name || 'Product').substring(0, 15))}`,
        isActive: true,
        isFeatured: false,
        ratingAverage: p.score ? Number(p.score) * 5 : 4.5,
        ratingCount: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching recommendations for user:', error);
      return [];
    }
  },

  getTrending: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return getTrendingProducts();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any>('/recommendations/trending');
      // Backend returns { products: [...] }
      const products = response.data.products || response.data || [];
      return products.map((p: Record<string, unknown>) => ({
        id: p.productId || p.id,
        sku: p.sku || '',
        name: p.name,
        description: p.description,
        shortDescription: p.description?.toString().substring(0, 100),
        price: p.price,
        productType: p.type || p.productType || 'PHYSICAL',
        categoryId: p.categoryId,
        providerType: 'REST',
        stock: 100,
        lowStockThreshold: 5,
        imageUrl: p.imageUrl || `https://placehold.co/300x300/e2e8f0/475569?text=${encodeURIComponent(String(p.name || 'Product').substring(0, 15))}`,
        isActive: true,
        isFeatured: false,
        ratingAverage: p.score ? Number(p.score) * 5 : 4.5,
        ratingCount: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching trending:', error);
      return [];
    }
  },

  getSimilar: async (productId: number): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      const product = mockProducts.find(p => p.id === productId);
      if (!product) return [];

      // Return products in same category or type
      return mockProducts
        .filter(p =>
          p.id !== productId &&
          p.isActive &&
          (p.categoryId === product.categoryId || p.productType === product.productType)
        )
        .slice(0, 4);
    }

    const response = await api.get<Product[]>(`/recommendations/similar/${productId}`);
    return response.data;
  },

  getPopular: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return mockProducts
        .filter(p => p.isActive)
        .sort((a, b) => b.ratingCount - a.ratingCount)
        .slice(0, 8);
    }

    const response = await api.get<Product[]>('/recommendations/popular');
    return response.data;
  },

  getByCategory: async (categoryId: number): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return mockProducts
        .filter(p => p.isActive && p.categoryId === categoryId)
        .sort((a, b) => b.ratingAverage - a.ratingAverage)
        .slice(0, 6);
    }

    const response = await api.get<Product[]>(`/recommendations/category/${categoryId}`);
    return response.data;
  },
};

export default recommendationService;
