'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const pathname = usePathname();

  useEffect(() => {
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname || '');
    
    if (isAuthPage) {
      document.documentElement.classList.remove('light');
      return;
    }

    const saved = localStorage.getItem('synapse_theme') as Theme;
    const current = saved || 'dark';
    setTheme(current);
    document.documentElement.classList.toggle('light', current === 'light');
  }, [pathname]);

  const toggleTheme = () => {
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname || '');
    if (isAuthPage) return;

    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('synapse_theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
