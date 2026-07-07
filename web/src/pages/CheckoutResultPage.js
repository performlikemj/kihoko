import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';

export default function CheckoutResultPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    apiService
      .getCheckoutSession(sessionId)
      .then((response) => {
        const data = response.data?.data || null;
        setSession(data);
        if (data && data.status === 'complete') {
          clearCart();
        }
      })
      .catch((err) => {
        console.error('Failed to load checkout session:', err);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Confirming your order...</div>
      </div>
    );
  }

  const paid = session?.paymentStatus === 'paid';
  const pending = session?.status === 'complete' && !paid;

  return (
    <motion.div
      className="portfolio-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="checkout-result">
        {paid ? (
          <>
            <h1>Thank you! ありがとうございます！</h1>
            <p>
              Your order has been received{session?.customerEmail ? (
                <> — a receipt was sent to <strong>{session.customerEmail}</strong></>
              ) : null}.
            </p>
            <p>Kihoko will carefully pack your order and ship it to you soon.</p>
          </>
        ) : pending ? (
          <>
            <h1>Almost there!</h1>
            <p>
              Your order is reserved and waiting for payment (for example at the
              convenience store). Once the payment is confirmed you will receive a
              receipt by email.
            </p>
          </>
        ) : (
          <>
            <h1>Order status unknown</h1>
            <p>
              We couldn't confirm your order. If you completed a payment you will
              still receive an email receipt from Stripe — nothing is lost.
            </p>
          </>
        )}
        <Link to="/shop" className="shop-back-link">← Back to the shop</Link>
      </div>
    </motion.div>
  );
}
