import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';
import { useCart, formatJpy } from '../context/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProduct(slug);
      const data = response.data?.data;
      // Guard against degraded responses (e.g. empty array) — only accept
      // an object that looks like a product
      setProduct(data && data.id ? data : null);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/shop/cart');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-message">
        <h2>Item not found</h2>
        <p>This item may no longer be available.</p>
        <Link to="/shop" className="shop-back-link">Back to the shop</Link>
      </div>
    );
  }

  const soldOut = product.status === 'sold' || product.stock === 0;
  const maxQuantity = product.maxPerOrder ?? (product.stock === null ? 10 : Math.min(product.stock, 10));
  const images = product.images || [];

  return (
    <motion.div
      className="product-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="product-detail-container">
        <div className="product-detail-images">
          <img
            src={images[selectedImage]?.url}
            alt={product.title}
            className="product-detail-main-image"
          />
          {images.length > 1 && (
            <div className="product-detail-thumbs">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.thumbnailUrl || image.url}
                  alt={`${product.title} ${index + 1}`}
                  className={index === selectedImage ? 'thumb-active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.title}</h1>
          <p className="product-detail-price">{formatJpy(product.priceJpy)}</p>
          {product.description && (
            <p className="product-detail-description">{product.description}</p>
          )}

          {soldOut ? (
            <p className="product-sold-out">Sold out</p>
          ) : (
            <>
              {product.stock !== null && product.stock <= 3 && (
                <p className="product-low-stock">Only {product.stock} left</p>
              )}
              {maxQuantity > 1 && (
                <label className="product-quantity">
                  Quantity
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  >
                    {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="product-actions">
                <button className="submit-button" onClick={handleBuyNow}>
                  Buy now
                </button>
                <button className="submit-button shop-secondary-button" onClick={handleAddToCart}>
                  {added ? 'Added ✓' : 'Add to cart'}
                </button>
              </div>
            </>
          )}

          <p className="product-shipping-note">
            Ships within Japan only (日本国内配送のみ). Payment is handled securely by Stripe.
          </p>
          <Link to="/shop" className="shop-back-link">← Back to the shop</Link>
        </div>
      </div>
    </motion.div>
  );
}
