import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';
import { useCart, formatJpy } from '../context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalJpy } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const response = await apiService.createCheckout(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      );
      const url = response.data?.data?.url;
      if (!url) {
        throw new Error('Checkout could not be started');
      }
      // Cart is cleared on the success page after payment
      window.location.href = url;
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(handleApiError(err));
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="portfolio-page">
        <div className="cart-empty">
          <h1>Your cart</h1>
          <p>Your cart is empty.</p>
          <Link to="/shop" className="shop-back-link">Browse the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="portfolio-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="cart-container">
        <h1>Your cart</h1>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <ul className="cart-items">
          {items.map((item) => (
            <li key={item.productId} className="cart-item">
              {item.image && (
                <Link to={`/shop/item/${item.slug || item.productId}`}>
                  <img src={item.image} alt={item.title} className="cart-item-image" />
                </Link>
              )}
              <div className="cart-item-info">
                <Link to={`/shop/item/${item.slug || item.productId}`} className="cart-item-title">
                  {item.title}
                </Link>
                <span className="cart-item-price">{formatJpy(item.priceJpy)}</span>
              </div>
              <div className="cart-item-controls">
                <select
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value, 10))}
                  aria-label={`Quantity of ${item.title}`}
                >
                  {Array.from({ length: item.maxQuantity || 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.title}`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-summary">
          <p className="cart-subtotal">
            Subtotal: <strong>{formatJpy(subtotalJpy)}</strong>
          </p>
          <p className="cart-note">
            Shipping is calculated at checkout. Ships within Japan only (日本国内配送のみ).
          </p>
          <button
            className="submit-button"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? 'Preparing checkout...' : 'Checkout'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
