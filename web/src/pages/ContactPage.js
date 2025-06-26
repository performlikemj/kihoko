import React from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1>Get in Touch</h1>
      <p>
        <a href="mailto:kiho@kihoko.com">kiho@kihoko.com</a>
      </p>
    </motion.div>
  );
}
