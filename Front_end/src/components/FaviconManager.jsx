import React, { useEffect } from 'react';
import favicon from '../assets/favicon.png';

const FaviconManager = () => {
  useEffect(() => {
    // Função para atualizar o favicon
    const updateFavicon = () => {
      let link = document.querySelector("link[rel*='icon']");
      
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      
      link.type = 'image/png';
      link.href = favicon;
    };

    updateFavicon();
  }, []);

  return null; // Componente invisível
};

export default FaviconManager;