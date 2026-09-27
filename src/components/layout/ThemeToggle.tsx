'use client';

import { useEffect } from 'react';

export function ThemeToggle() {
  useEffect(() => {
    // Ensure document always stays in light mode
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zerogap-theme');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, []);

  return null;
}
