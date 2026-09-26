import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService, wishlistService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    try {
      setCartLoading(true);
      const res = await cartService.getCart();
      setCart(res.data.data);
    } catch {
      // silent fail
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data.data || []);
    } catch {
      setWishlist([]);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlist([]);
    }
  }, [isAuthenticated, isCustomer, fetchCart, fetchWishlist]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const res = await cartService.addToCart({ product_id: productId, quantity });
      setCart(res.data.data);
      toast.success('Added to cart! 🛒');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  }, []);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      const res = await cartService.updateCartItem(itemId, { quantity });
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const res = await cartService.removeFromCart(itemId);
      setCart(res.data.data);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart(prev => prev ? { ...prev, items: [], item_count: 0, final_amount: 0 } : null);
    } catch {
      // silent fail
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    try {
      await wishlistService.addToWishlist(productId);
      await fetchWishlist();
      toast.success('Added to wishlist ❤️');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to wishlist';
      if (msg.includes('already')) {
        toast.error('Already in your wishlist');
      } else {
        toast.error(msg);
      }
      return false;
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const cartItemCount = cart?.item_count || 0;
  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider value={{
      cart, wishlist, cartLoading, cartItemCount, wishlistCount,
      fetchCart, fetchWishlist,
      addToCart, updateCartItem, removeFromCart, clearCart,
      addToWishlist, removeFromWishlist, isInWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
