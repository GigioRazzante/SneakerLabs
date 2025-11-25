// src/contexts/ThemeContext.jsx - ARQUIVO NOVO
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [primaryColor, setPrimaryColor] = useState('#FF9D00');

    // Atualiza a cor quando o usuário muda
    useEffect(() => {
        if (user?.cor_perfil) {
            setPrimaryColor(user.cor_perfil);
            updateCSSVariables(user.cor_perfil);
        } else {
            // Reset para cor padrão se não houver usuário
            updateCSSVariables('#FF9D00');
        }
    }, [user]);

    // Função para calcular cores derivadas
    const calculateDerivedColors = (baseColor) => {
        // Converte hex para RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 157, b: 0 }; // Fallback laranja
        };

        const rgb = hexToRgb(baseColor);
        
        // Calcula cor hover (20% mais escura)
        const hoverColor = `rgb(
            ${Math.max(0, rgb.r - 51)},
            ${Math.max(0, rgb.g - 51)}, 
            ${Math.max(0, rgb.b - 51)}
        )`;
        
        // Calcula cor light (90% mais clara com transparência)
        const lightColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;

        return { hoverColor, lightColor };
    };

    // Helper para calcular luminância (para determinar cor do texto)
    const calculateLuminance = (hex) => {
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 157, b: 0 };
        };
        
        const rgb = hexToRgb(hex);
        return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    };

    // Atualiza CSS Variables globalmente
    const updateCSSVariables = (color) => {
        const { hoverColor, lightColor } = calculateDerivedColors(color);
        
        // Determina cor do texto baseado no contraste
        const isLightColor = calculateLuminance(color) > 0.5;
        const textColor = isLightColor ? '#000000' : '#FFFFFF';
        
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--primary-hover', hoverColor);
        document.documentElement.style.setProperty('--primary-light', lightColor);
        document.documentElement.style.setProperty('--primary-text', textColor);
        
        console.log('🎨 Tema atualizado:', { color, hoverColor, textColor });
    };

    const updatePrimaryColor = (color) => {
        setPrimaryColor(color);
        updateCSSVariables(color);
    };

    return (
        <ThemeContext.Provider value={{ 
            primaryColor, 
            updatePrimaryColor,
            calculateDerivedColors 
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};