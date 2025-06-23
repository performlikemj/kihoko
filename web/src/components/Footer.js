import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="text-center">
        <p className="mb-0 py-0">
          &copy; {currentYear} Kihoko Mizuno Jones. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 