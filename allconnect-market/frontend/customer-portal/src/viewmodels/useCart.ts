import { useCallback } from 'react';
import { useCartStore } from '../stores/cartStore';
import { Product } from '../models';

export const useCart = () => {
  const {
    items,
    isOpen,
    itemCount,
    subtotal,
    tax,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
  } = useCartStore();

  const addToCart = useCallback((
    product: Product,
    quantity: number = 1,
    reservationDate?: string,
    reservationTime?: string
  ) => {
    addItem(product, quantity, reservationDate, reservationTime);
  }, [addItem]);

  const removeFromCart = useCallback((productId: number) => {
    removeItem(productId);
  }, [removeItem]);

  const updateItemQuantity = useCallback((productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  }, [updateQuantity]);

  const clearAllItems = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const getItemByProductId = useCallback((productId: number) => {
    return items.find(item => item.productId === productId);
  }, [items]);

  const hasPhysicalProducts = items.some(item => item.product.productType === 'PHYSICAL');
  const hasServices = items.some(item => item.product.productType === 'SERVICE');
  const hasSubscriptions = items.some(item => item.product.productType === 'SUBSCRIPTION');

  return {
    items,
    isOpen,
    itemCount: itemCount(),
    subtotal: subtotal(),
    tax: tax(),
    total: total(),
    hasPhysicalProducts,
    hasServices,
    hasSubscriptions,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    updateQuantity: updateItemQuantity,
    clearAllItems,
    clearCart: clearAllItems,
    getItemByProductId,
    toggleCart,
    setCartOpen,
  };
};

export default useCart;
