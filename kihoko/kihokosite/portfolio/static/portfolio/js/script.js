// script.js

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Check localStorage accessibility
   */
  let localStorageEnabled = true;
  try {
    localStorage.setItem('storage_test', 'test_value');
    localStorage.removeItem('storage_test');
  } catch (err) {
    localStorageEnabled = false;
    console.error('LocalStorage is not accessible:', err);
  }

  /**
   * In-memory fallback if localStorage fails
   */
  let themeMemory = 'light';

  /**
   * Theme Toggle Setup
   */
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  function setTheme(newTheme) {
    console.log('Attempting to set theme:', newTheme);
    body.setAttribute('data-bs-theme', newTheme);

    // If localStorage is accessible, store theme. Otherwise use fallback variable
    if (localStorageEnabled) {
      try {
        localStorage.setItem('theme', newTheme);
      } catch (err) {
        console.error('Error writing theme to localStorage:', err);
        localStorageEnabled = false;
        themeMemory = newTheme;
      }
    } else {
      themeMemory = newTheme;
    }

    // Update button icon and optional "active" class
    if (themeToggle) {
      themeToggle.innerHTML =
        newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      themeToggle.classList.toggle('active', newTheme === 'dark');
    }
  }

  /**
   * Load theme from localStorage if accessible,
   * else from our in-memory fallback.
   */
  let storedTheme = 'light';
  if (localStorageEnabled) {
    try {
      storedTheme = localStorage.getItem('theme') || 'light';
    } catch (err) {
      console.error('Error reading theme from localStorage:', err);
      localStorageEnabled = false;
      storedTheme = themeMemory; // fallback to in-memory
    }
  } else {
    storedTheme = themeMemory;
  }
  setTheme(storedTheme);

  // Listen for clicks on #theme-toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  /**
   * AOS initialization (Optional)
   */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      offset: 100,
      once: true
    });
  }
});