import { useState, useCallback, useEffect } from 'react';
import { catalogService, getErrorMessage } from '../services';
import { Product, Category, ProductFilters, PaginatedResponse } from '../models';

export const useProducts = (initialFilters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (newFilters?: ProductFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const appliedFilters = newFilters || filters;
      const response = await catalogService.getProducts(appliedFilters);

      setProducts(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await catalogService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    fetchProducts(updated);
  }, [filters, fetchProducts]);

  const goToPage = useCallback((page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchProducts(updated);
  }, [filters, fetchProducts]);

  const resetFilters = useCallback(() => {
    const reset: ProductFilters = { page: 1, limit: 12 };
    setFilters(reset);
    fetchProducts(reset);
  }, [fetchProducts]);

  // Initial load and when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      fetchProducts(initialFilters);
    } else {
      fetchProducts();
    }
    fetchCategories();
  }, [initialFilters?.productType, initialFilters?.categoryId, initialFilters?.search]);

  return {
    products,
    categories,
    filters,
    pagination,
    isLoading,
    error,
    fetchProducts,
    updateFilters,
    goToPage,
    resetFilters,
  };
};

export const useProduct = (productId: number | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await catalogService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    similarProducts,
    isLoading,
    error,
    refetch: () => productId && fetchProduct(productId),
  };
};

export const useProductDetail = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error('ID de producto inválido');
      }
      const data = await catalogService.getProductById(numericId);
      setProduct(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: () => productId && fetchProduct(productId),
  };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await catalogService.getFeaturedProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching featured products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return { products, isLoading, refetch: fetchFeatured };
};

export default useProducts;
