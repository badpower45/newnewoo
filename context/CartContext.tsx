import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export interface CartItem extends Product {
  quantity: number;
  cartId?: number; // ID from database
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from API if user is logged in, else local storage
  useEffect(() => {
    if (user) {
      api.cart.get(user.id).then(data => {
        if (data.data) {
          setItems(data.data);
        }
      }).catch(err => console.error("Failed to fetch cart", err));
    } else {
      try {
        const saved = localStorage.getItem('cart_items');
        if (saved) setItems(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load cart from storage', error);
      }
    }
  }, [user]);

  // Save to localStorage if not logged in
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('cart_items', JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to storage', error);
      }
    }
  }, [items, user]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (user) {
      // Optimistic update
      setItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });

      try {
        await api.cart.add({ userId: user.id, productId: product.id, quantity });
        // Optionally refetch to get DB IDs
      } catch (err) {
        console.error("Failed to add to cart", err);
        // Revert?
      }
    } else {
      setItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    }
    setIsCartOpen(true);
  };

  const removeFromCart = async (productId: string | number) => {
    if (user) {
      setItems(prev => prev.filter(item => item.id !== productId));
      try {
        await api.cart.remove(user.id, String(productId));
      } catch (err) {
        console.error("Failed to remove from cart", err);
      }
    } else {
      setItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      setItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
      try {
        await api.cart.update({ userId: user.id, productId: String(productId), quantity });
      } catch (err) {
        console.error("Failed to update quantity", err);
      }
    } else {
      setItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setItems([]);

  const toggleCart = () => setIsCartOpen(prev => !prev);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
