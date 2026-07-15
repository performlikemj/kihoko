import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'kihoko-cart';
const MAX_QUANTITY = 10;

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage failures (private mode etc.) — cart just won't persist
    }
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      // Server-provided ceiling (mirrors checkout validation); fall back to
      // the local cap only if the API didn't send maxPerOrder
      const maxForProduct = product.maxPerOrder ??
        (product.stock === null || product.stock === undefined
          ? MAX_QUANTITY
          : Math.min(product.stock, MAX_QUANTITY));
      if (maxForProduct < 1) {
        // Out of stock — never create a zero-quantity line, it would fail
        // checkout validation for the whole cart
        return current;
      }
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxForProduct) }
            : item
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          title: product.title,
          priceJpy: product.priceJpy,
          image: product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || null,
          maxQuantity: maxForProduct,
          quantity: Math.min(quantity, maxForProduct),
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.maxQuantity || MAX_QUANTITY) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalJpy = items.reduce((sum, item) => sum + item.priceJpy * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, count, subtotalJpy }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function formatJpy(amount) {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}
