import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../models';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
  tax: () => number;
  total: () => number;

  // Actions
  addItem: (product: Product, quantity?: number, reservationDate?: string, reservationTime?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
}

const TAX_RATE = 0.13; // 13% Costa Rica IVA

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      },

      tax: () => {
        return get().subtotal() * TAX_RATE;
      },

      total: () => {
        return get().subtotal() + get().tax();
      },

      addItem: (product, quantity = 1, reservationDate, reservationTime) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.id);

          if (existingItem && product.productType === 'PHYSICAL') {
            // For physical products, increase quantity
            return {
              items: state.items.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // For services/subscriptions or new items, add new entry
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            reservationDate,
            reservationTime,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setCartOpen: (isOpen) => {
        set({ isOpen });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
