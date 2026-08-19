import { useState, useEffect } from 'react';

const STORAGE_KEY = 'streetdex_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const isFavorite = prev.includes(productId);
      const next = isFavorite 
        ? prev.filter((id) => id !== productId) 
        : [...prev, productId];
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save favorites', e);
      }
      return next;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return { favorites, toggleFavorite, isFavorite };
};
