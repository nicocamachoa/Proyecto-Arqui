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

    const response = await api.get<Product[]>(`/recommendations/user/${userId}`);
    return response.data;
  },

  getTrending: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(200);
      return getTrendingProducts();
    }

    const response = await api.get<Product[]>('/recommendations/trending');
    return response.data;
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
