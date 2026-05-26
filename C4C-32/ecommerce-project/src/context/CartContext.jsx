import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCartSubtotal, getShippingCost } from '../utils/helpers';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  // Fetch cart from database when logged in
  const fetchCart = async () => {
    try {
      const data = await api.get('/api/cart');
      // Map API cart items to the shape expected by the frontend
      const mapped = data.cart.map(item => ({
        id: item.product.id,
        title: item.product.title,
        price: Number(item.product.price),
        image: item.product.image_urls?.[0] || "/images/earthen-sanctuary-vase.png",
        subtitle: "",
        quantity: item.quantity,
        cartItemId: item.id // database cart item ID
      }));
      setCartItems(mapped);
    } catch (err) {
      console.error('[CartContext] Error fetching cart from API:', err);
    }
  };

  // Guest cart helper: save local state and localStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('karighar_cart', JSON.stringify(items));
  };

  // Sync / Merge guest cart items into Supabase cart when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      const mergeCart = async () => {
        const storedCart = localStorage.getItem('karighar_cart');
        if (storedCart) {
          try {
            const guestItems = JSON.parse(storedCart);
            for (const item of guestItems) {
              await api.post('/api/cart', { product_id: item.id, quantity: item.quantity });
            }
            // Clear guest cart from localStorage
            localStorage.removeItem('karighar_cart');
          } catch (err) {
            console.error('[CartContext] Error merging guest cart:', err);
          }
        }
        await fetchCart();
      };
      mergeCart();
    } else {
      // Load guest cart
      const storedCart = localStorage.getItem('karighar_cart');
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (err) {
          console.error('[CartContext] Failed to parse guest cart:', err);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    }
  }, [isLoggedIn]);

  // Add a product to the cart
  const addToCart = async (product, quantity = 1) => {
    if (isLoggedIn) {
      try {
        await api.post('/api/cart', { product_id: product.id, quantity });
        await fetchCart();
        toast.success(`"${product.title}" added to cart!`);
      } catch (err) {
        toast.error(err.message || 'Failed to add to cart');
      }
    } else {
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      let updatedItems = [...cartItems];

      if (existingItemIndex > -1) {
        updatedItems[existingItemIndex].quantity += quantity;
      } else {
        updatedItems.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images ? product.images[0] : "/images/earthen-sanctuary-vase.png",
          subtitle: product.subtitle || "",
          quantity: quantity
        });
      }
      saveCart(updatedItems);
      toast.success(`"${product.title}" added to cart!`);
    }
    setIsCartOpen(true); // Automatically open the cart drawer when adding an item
  };

  // Remove an item from the cart
  const removeFromCart = async (productId) => {
    if (isLoggedIn) {
      try {
        const item = cartItems.find(i => i.id === productId);
        if (item && item.cartItemId) {
          await api.del(`/api/cart/${item.cartItemId}`);
          await fetchCart();
        }
      } catch (err) {
        toast.error(err.message || 'Failed to remove from cart');
      }
    } else {
      const updatedItems = cartItems.filter(item => item.id !== productId);
      saveCart(updatedItems);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (isLoggedIn) {
      try {
        const item = cartItems.find(i => i.id === productId);
        if (item && item.cartItemId) {
          await api.patch(`/api/cart/${item.cartItemId}`, { quantity: newQuantity });
          await fetchCart();
        }
      } catch (err) {
        toast.error(err.message || 'Failed to update quantity');
      }
    } else {
      const updatedItems = cartItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      saveCart(updatedItems);
    }
  };

  // Clear the cart
  const clearCart = async () => {
    if (isLoggedIn) {
      try {
        await api.del('/api/cart/clear');
        setCartItems([]);
      } catch (err) {
        toast.error(err.message || 'Failed to clear cart');
      }
    } else {
      saveCart([]);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Computed values
  const subtotal = getCartSubtotal(cartItems);
  const shippingFee = getShippingCost(subtotal);
  const totalAmount = subtotal + shippingFee;
  const totalItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      subtotal,
      shippingFee,
      totalAmount,
      totalItemsCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
