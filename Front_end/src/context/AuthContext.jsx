// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Criar o Context
const AuthContext = createContext();

// 2. Criar o Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 3. Função para buscar dados do usuário
    const fetchUserData = async (clienteId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/cliente/${clienteId}`);
            if (response.ok) {
                const userData = await response.json();
                return { ...userData, id: clienteId };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            return null;
        }
    };

    // 4. Verificar autenticação ao carregar o app
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const clienteId = localStorage.getItem('clienteId');
                if (clienteId) {
                    const userData = await fetchUserData(clienteId);
                    if (userData) {
                        setUser(userData);
                    } else {
                        // Dados inválidos, limpa o localStorage
                        localStorage.removeItem('clienteId');
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // 5. Função de Login
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email, 
                    senha: password 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Busca os dados completos do usuário
                const userData = await fetchUserData(data.clienteId);
                if (userData) {
                    setUser(userData);
                    localStorage.setItem('clienteId', data.clienteId);
                    return { success: true };
                } else {
                    return { 
                        success: false, 
                        error: 'Erro ao carregar dados do usuário' 
                    };
                }
            } else {
                const errorData = await response.json();
                return { 
                    success: false, 
                    error: errorData.error || 'Erro no login' 
                };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { 
                success: false, 
                error: 'Erro de conexão com o servidor' 
            };
        }
    };

    // 6. Função de Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('clienteId');
    };

    // 7. Função para atualizar dados do usuário
    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    // 8. Valores disponíveis no Context
    const value = {
        user,
        login,
        logout,
        updateUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 9. Hook personalizado para usar o AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};