import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

// Este componente é o Rodapé simples (Footer), focado apenas em contato e marca.
// AGORA COM SISTEMA DE TEMAS DINÂMICO
const Footer = () => {
    const { primaryColor } = useTheme();

    return (
        <footer className="footer-minimal">
            {/* Estilos CSS embutidos para garantir a aparência sem Tailwind */}
            <style>
                {`
                .footer-minimal {
                    background-color: #1a1a1a; /* Preto escuro */
                    color: #e0e0e0; /* Cinza claro para o texto */
                    padding: 1.5rem 1rem;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    text-align: center;
                    border-top: 4px solid var(--primary-color, #FF9D00); /* 🎨 LINHA DINÂMICA */
                    transition: border-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }

                .footer-minimal-content {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .footer-contact {
                    margin-bottom: 0.75rem;
                }

                .footer-contact a {
                    color: #cccccc;
                    text-decoration: none;
                    margin: 0 15px;
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .footer-contact a:hover {
                    color: var(--primary-color, #FF9D00); /* 🎨 COR DINÂMICA NO HOVER */
                    text-decoration: underline;
                    background-color: rgba(255, 255, 255, 0.05); /* 🎨 FUNDO SUTIL NO HOVER */
                    transform: translateY(-1px); /* 🎨 EFEITO SUTIL DE ELEVAÇÃO */
                }
                
                .footer-copyright {
                    margin-top: 0.5rem;
                    font-size: 0.8rem;
                    color: #999999;
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }

                .footer-logo-orange {
                    color: var(--primary-color, #FF9D00); /* 🎨 COR DINÂMICA */
                    font-weight: bold;
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }

                /* 🎨 ESTILOS PARA LINKS DE REDE SOCIAL */
                .social-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    color: var(--primary-color, #FF9D00);
                    transform: translateY(-2px);
                }

                /* 🎨 BADGE PARA O NOME DA MARCA */
                .brand-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: linear-gradient(135deg, var(--primary-color, #FF9D00) 0%, var(--primary-hover, #e68a00) 100%);
                    color: white;
                    border-radius: 1rem;
                    font-weight: 700;
                    font-size: 0.85rem;
                    margin-left: 0.5rem;
                    transition: all 0.3s ease;
                }

                .brand-badge:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                /* Responsividade: Garante que os links se empilhem se necessário */
                @media (max-width: 450px) {
                    .footer-contact {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .footer-contact a {
                        margin: 0;
                        padding: 0.5rem;
                    }
                    
                    .brand-badge {
                        margin-left: 0.25rem;
                        margin-top: 0.25rem;
                    }
                }

                /* 🎨 ANIMAÇÃO SUTIL PARA O FOOTER */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .footer-minimal {
                    animation: fadeInUp 0.6s ease-out;
                }

                /* 🎨 ESTILOS PARA MODO ESCURO (se aplicável) */
                @media (prefers-color-scheme: dark) {
                    .footer-minimal {
                        background-color: #0a0a0a;
                    }
                    
                    .footer-contact a:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                    }
                }

                /* 🎨 MELHORIAS DE ACESSIBILIDADE */
                .footer-contact a:focus {
                    outline: 2px solid var(--primary-color, #FF9D00);
                    outline-offset: 2px;
                }

                .brand-badge:focus {
                    outline: 2px solid white;
                    outline-offset: 2px;
                }
                `}
            </style>

            <div className="footer-minimal-content">
                
                <div className="footer-contact">
                    <a 
                        href="mailto:sneakerlab@email.com" 
                        className="social-link"
                        aria-label="Enviar email para SneakerLab"
                    >
                        <span>✉️</span> Email: sneakerlab@email.com
                    </a>
                    <a 
                        href="https://instagram.com/sneakerlab" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                        aria-label="Seguir SneakerLab no Instagram"
                    >
                        <span>📷</span> Instagram: @sneakerlab
                    </a>
                </div>

                {/* ATRIBUIÇÃO BÁSICA DA MARCA - AGORA COM BADGE DINÂMICO */}
                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} 
                    <span className="brand-badge">SNEAKLAB</span>
                    . Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;