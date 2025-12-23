import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { useBranch } from './BranchContext';
import { useToast } from '../components/Toast';

// Financial Constants
const SERVICE_FEE = 7;
const MIN_ORDER = 0;
const FREE_SHIPPING_THRESHOLD = 600;
const LOYALTY_POINTS_RATIO = 1; // 1 EGP = 1 Point
const REWARD_POINTS_REQUIRED = 1000; // Points needed for reward
const REWARD_COUPON_VALUE = 35; // EGP discount

export interface CartItem extends Product {
  quantity: number;
  cartId?: number; // ID from database
  substitutionPreference?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, substitutionPreference?: string) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number, substitutionPreference?: string) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  serviceFee: number;
  finalTotal: number;
  loyaltyPointsEarned: number;
  meetsMinimumOrder: boolean;
  redeemPointsForCoupon: () => Promise<{ success: boolean; couponCode?: string; message: string }>;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { selectedBranch } = useBranch();
  const { showToast, ToastContainer } = useToast();

  // Load cart from API if user is logged in (not guest), else local storage
  useEffect(() => {
    if (user && !user.isGuest) {
      syncCart();
    } else {
      try {
        const saved = localStorage.getItem('cart_items');
        const timestamp = localStorage.getItem('cart_timestamp');
        
        // Expire cart after 30 days
        if (timestamp && Date.now() - parseInt(timestamp) > 30 * 24 * 60 * 60 * 1000) {
          console.log('🗑️ Cart expired, clearing...');
          localStorage.removeItem('cart_items');
          localStorage.removeItem('cart_timestamp');
          localStorage.removeItem('cart_version');
          setItems([]);
        } else if (saved) {
          const parsedItems = JSON.parse(saved);
          // Normalize prices to numbers
          const normalizedItems = parsedItems.map((item: any) => ({
            ...item,
            price: Number(item.price) || 0
          }));
          setItems(normalizedItems);
        }
      } catch (error) {
        console.error('Failed to load cart from storage', error);
        // Clear corrupted cart data
        localStorage.removeItem('cart_items');
        setItems([]);
      }
    }
  }, [user, selectedBranch]); // Re-sync when branch changes

  const syncCart = async () => {
    if (!user || user.isGuest) return;
    try {
      const branchId = selectedBranch?.id || 1;
      const data = await api.cart.get(user.id, branchId);
      if (data.data) {
        // Normalize prices to numbers
        const normalizedItems = data.data.map((item: any) => ({
          ...item,
          price: Number(item.price) || 0
        }));
        setItems(normalizedItems);
      }
    } catch (err) {
      // Silent fallback: backend unavailable, use local state
      console.error('Failed to sync cart:', err);
    }
  };

  // Save to localStorage if not logged in or guest
  useEffect(() => {
    if (!user || user.isGuest) {
      try {
        localStorage.setItem('cart_items', JSON.stringify(items));
        localStorage.setItem('cart_timestamp', Date.now().toString());
        localStorage.setItem('cart_version', '1.0');
      } catch (error) {
        console.error('Failed to save cart to storage', error);
      }
    }
  }, [items, user]);

  const addToCart = async (product: Product, quantity = 1, substitutionPreference = 'none') => {
    // Ensure price is a number
    const normalizedProduct = {
      ...product,
      price: Number(product.price) || 0
    };
    
    // Branch availability check
    if (selectedBranch) {
      try {
        const res = await api.branchProducts.getByBranch(selectedBranch.id);
        const list = res.data || res || [];
        const pid = normalizedProduct.id;
        const bp = list.find((x: any) => String(x.product_id ?? x.productId ?? x.id) === String(pid));
        if (bp) {
          const stock = bp.available_quantity ?? bp.stock_quantity ?? bp.stockQuantity;
          const reserved = bp.reserved_quantity ?? bp.reservedQuantity ?? 0;
          if (typeof stock === 'number') {
            const availableCount = Math.max(0, stock - reserved);
            const existing = items.find(i => String(i.id) === String(pid));
            const desired = (existing?.quantity || 0) + quantity;
            if (desired > availableCount) {
              showToast('هذا المنتج غير متوفر بالكمية المطلوبة في هذا الفرع', 'warning');
              return;
            }
          }
          // Override price if branch price exists
          const branchPrice = bp.branch_price ?? bp.branchPrice;
          if (typeof branchPrice === 'number') {
            normalizedProduct.price = branchPrice;
          }
        }
      } catch (e) {
        console.error('Failed to verify branch availability', e);
      }
    }
    if (user && !user.isGuest) {
      // Optimistic update with smooth animation
      setItems(prev => {
        const existing = prev.find(item => String(item.id) === String(normalizedProduct.id));
        if (existing) {
          return prev.map(item =>
            String(item.id) === String(normalizedProduct.id)
              ? { ...item, quantity: item.quantity + quantity, substitutionPreference: substitutionPreference || item.substitutionPreference }
              : item
          );
        }
        return [...prev, { ...normalizedProduct, quantity, substitutionPreference }];
      });

      // Show success toast
      showToast(`تمت إضافة ${normalizedProduct.name || normalizedProduct.title} إلى السلة`, 'success');

      // Add to cart in background without blocking UI
      api.cart.add({ 
        userId: user.id, 
        productId: String(normalizedProduct.id), 
        quantity,
        substitutionPreference 
      }).then(() => {
        // Debounced sync - only sync after 300ms of no activity
        if (window.cartSyncTimeout) clearTimeout(window.cartSyncTimeout);
        window.cartSyncTimeout = setTimeout(() => syncCart(), 300);
      }).catch(err => {
        console.error("Failed to add to cart", err);
        syncCart(); // Revert on error
      });
    } else {
      setItems(prev => {
        const existing = prev.find(item => String(item.id) === String(normalizedProduct.id));
        if (existing) {
          return prev.map(item =>
            String(item.id) === String(normalizedProduct.id)
              ? { ...item, quantity: item.quantity + quantity, substitutionPreference: substitutionPreference || item.substitutionPreference }
              : item
          );
        }
        return [...prev, { ...normalizedProduct, quantity, substitutionPreference }];
      });
      
      // Show success toast for guests too
      showToast(`تمت إضافة ${normalizedProduct.name || normalizedProduct.title} إلى السلة`, 'success');
    }
    setIsCartOpen(true);
  };

  const removeFromCart = async (productId: string | number) => {
    if (user && !user.isGuest) {
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

  const updateQuantity = async (productId: string | number, quantity: number, substitutionPreference?: string) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Get current item
    const current = items.find(i => String(i.id) === String(productId));
    
    // Check stock availability for ANY quantity change
    const isQuantityIncrease = current && quantity > current.quantity;
    
    if (selectedBranch && isQuantityIncrease) {
      try {
        const res = await api.branchProducts.getByBranch(selectedBranch.id);
        const list = res.data || res || [];
        const bp = list.find((x: any) => String(x.product_id ?? x.productId ?? x.id) === String(productId));
        if (bp) {
          const stock = bp.available_quantity ?? bp.stock_quantity ?? bp.stockQuantity;
          const reserved = bp.reserved_quantity ?? bp.reservedQuantity ?? 0;
          if (typeof stock === 'number') {
            const availableCount = Math.max(0, stock - reserved);
            if (quantity > availableCount) {
              showToast(`الكمية المتاحة: ${availableCount} فقط`, 'warning');
              // Set to maximum available
              quantity = availableCount;
              if (quantity < 1) {
                removeFromCart(productId);
                return;
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to verify branch availability on update', e);
      }
    }

    // INSTANT UI update - no delay!
    setItems(prev =>
      prev.map(item =>
        item.id === productId 
          ? { ...item, quantity, ...(substitutionPreference && { substitutionPreference }) } 
          : item
      )
    );

    if (user && !user.isGuest) {
      // Very fast debounced API call - only 150ms
      if (window.quantityUpdateTimeout) clearTimeout(window.quantityUpdateTimeout);
      window.quantityUpdateTimeout = setTimeout(async () => {
        try {
          await api.cart.update({ 
            userId: user.id, 
            productId: String(productId), 
            quantity,
            ...(substitutionPreference && { substitutionPreference })
          });
        } catch (err) {
          console.error("Failed to update quantity", err);
          syncCart(); // Revert on error
        }
      }, 150); // Super fast - only 150ms wait!
    }
  };

  const clearCart = async () => {
    if (user && !user.isGuest) {
      setItems([]);
      try {
        await api.cart.clear(user.id);
      } catch (err) {
        console.error("Failed to clear cart", err);
      }
    } else {
      setItems([]);
    }
  };

  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Financial Calculations - ensure price is always a number
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0);
  
  // Service fee: 7 EGP if under free shipping threshold, otherwise 0
  const serviceFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SERVICE_FEE;
  
  // Final total with service fee
  const finalTotal = totalPrice + serviceFee;
  
  // Loyalty points earned (1:1 ratio with total price, rounded down)
  const loyaltyPointsEarned = Math.floor(totalPrice * LOYALTY_POINTS_RATIO);
  
  // Check if order meets minimum requirement
  const meetsMinimumOrder = totalPrice >= MIN_ORDER;

  // Redeem 1000 points for 35 EGP coupon
  const redeemPointsForCoupon = async (): Promise<{ success: boolean; couponCode?: string; message: string }> => {
    if (!user || user.isGuest) {
      return { success: false, message: 'يجب تسجيل الدخول لاسترداد النقاط' };
    }

    try {
      // Check user's current loyalty points
      const userPoints = user.loyalty_points || user.loyaltyPoints || 0;
      
      if (userPoints < REWARD_POINTS_REQUIRED) {
        return { 
          success: false, 
          message: `تحتاج إلى ${REWARD_POINTS_REQUIRED - userPoints} نقطة إضافية. لديك ${userPoints} نقطة فقط.` 
        };
      }

      // Generate unique coupon code
      const couponCode = `REWARD${Date.now()}`;
      
      // Create coupon via API
      const response = await api.post('/coupons/redeem', {
        userId: user.id,
        pointsToRedeem: REWARD_POINTS_REQUIRED,
        couponCode,
        discountValue: REWARD_COUPON_VALUE
      });

      if (response.success) {
        showToast(`تم إنشاء كوبون بقيمة ${REWARD_COUPON_VALUE} جنيه! الكود: ${couponCode}`, 'success');
        return { 
          success: true, 
          couponCode, 
          message: `تم استبدال ${REWARD_POINTS_REQUIRED} نقطة بكوبون خصم ${REWARD_COUPON_VALUE} جنيه` 
        };
      } else {
        return { success: false, message: response.message || 'فشل إنشاء الكوبون' };
      }
    } catch (error: any) {
      console.error('Error redeeming points:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'حدث خطأ أثناء استبدال النقاط' 
      };
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCart,
      totalItems,
      totalPrice,
      serviceFee,
      finalTotal,
      loyaltyPointsEarned,
      meetsMinimumOrder,
      redeemPointsForCoupon,
      isCartOpen,
      toggleCart
    }}>
      <ToastContainer />
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
