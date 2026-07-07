import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';
import { formatJpy } from '../context/CartContext';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProducts();
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !products.length) {
    return (
      <div className="loading-spinner">
        <div>Loading the shop...</div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="shop-intro">
          <h1>Shop</h1>
          <p>
            Original art, prints and goods by Kihoko. Shipping within Japan only
            (日本国内配送のみ).
          </p>
        </div>
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        {products.length > 0 ? (
          <div className="art-grid">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div className="art-card shop-card" whileHover={{ scale: 1.02 }}>
                  <Link to={`/shop/item/${product.slug || product.id}`}>
                    <img
                      src={product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url}
                      alt={product.title}
                      loading="lazy"
                    />
                    {product.status === 'sold' && (
                      <span className="shop-sold-badge">Sold</span>
                    )}
                    <div className="art-card-overlay">
                      <span className="art-card-title">{product.title}</span>
                      <span className="shop-card-price">{formatJpy(product.priceJpy)}</span>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="no-images">
              <p>Nothing in the shop just yet — please check back soon!</p>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
