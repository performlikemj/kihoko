import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="about-content">
        <p>
          Kihoko Mizuno Jones grew up in a small Gifu town famous for its
          centuries-old ceramic kilns. After immersing herself in ceramic arts at
          university, she later moved to Los Angeles, where vibrant street
          culture sparked her career as an illustrator. Now living in Osaka,
          Japan, Kihoko splits her time between pottery, illustration, and the
          tattoo studio.
        </p>
        <p>
          Whether you’re looking for an illustration, a one-of-a-kind ceramic
          piece, or a thoughtfully designed tattoo, she’d love to hear from you.
        </p>
      </div>
    </motion.div>
  );
}
