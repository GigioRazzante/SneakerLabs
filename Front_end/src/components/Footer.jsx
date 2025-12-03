import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const Footer = () => {
    const { primaryColor } = useTheme();

    return (
        <>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-contact">
                        <a href="mailto:sneakerlab@email.com" className="contact-link">
                            ✉️ Email: sneakerlab@email.com
                        </a>
                        <a href="https://instagram.com/sneakerlab" target="_blank" rel="noopener noreferrer" className="contact-link">
                            📷 Instagram: @sneakerlab
                        </a>
                    </div>
                    
                    <div className="footer-brand">
                        <span className="brand-name" style={{ color: primaryColor }}>SNEAKLAB</span>
                        <span className="brand-emoji">👟</span>
                    </div>
                    
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} SneakLab. Todos os direitos reservados.
                    </p>
                </div>
            </footer>

            <style>{`
                .footer {
                    background: #1a1a1a;
                    color: #e0e0e0;
                    padding: 2rem 1rem;
                    text-align: center;
                    border-top: 4px solid ${primaryColor};
                    width: 100%;
                    margin-top: auto;
                }
                
                .footer-content {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .footer-contact {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }
                
                .contact-link {
                    color: #cccccc;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .contact-link:hover {
                    color: ${primaryColor};
                    background: rgba(var(--primary-color-rgb), 0.1);
                    transform: translateY(-2px);
                }
                
                .footer-brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                
                .brand-emoji {
                    font-size: 1.2rem;
                }
                
                .footer-copyright {
                    color: #999;
                    font-size: 0.8rem;
                    margin: 0;
                }
                
                /* Responsividade */
                @media (max-width: 768px) {
                    .footer {
                        padding: 1.5rem 1rem;
                    }
                    
                    .footer-contact {
                        gap: 1rem;
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .contact-link {
                        width: 100%;
                        max-width: 300px;
                        text-align: center;
                    }
                    
                    .footer-brand {
                        font-size: 1.3rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .footer {
                        padding: 1.25rem 0.75rem;
                    }
                    
                    .footer-content {
                        gap: 1.25rem;
                    }
                    
                    .contact-link {
                        font-size: 0.85rem;
                        padding: 0.4rem 0.6rem;
                    }
                    
                    .footer-brand {
                        font-size: 1.2rem;
                    }
                    
                    .footer-copyright {
                        font-size: 0.75rem;
                    }
                }
                
                /* Animações */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .footer {
                    animation: fadeIn 0.5s ease-out;
                }
                
                /* Acessibilidade */
                .contact-link:focus {
                    outline: 2px solid ${primaryColor};
                    outline-offset: 2px;
                }
            `}</style>
        </>
    );
};

export default Footer;