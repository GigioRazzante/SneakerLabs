import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const Footer = () => {
    const { primaryColor } = useTheme();

    return (
        <>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="logo-text-creative">Sneak</span>
                        <span 
                            className="logo-text-colored"
                            style={{ color: primaryColor }}
                        >
                            Lab
                        </span>
                    </div>
                    
                    <div className="footer-contact">
                        <a href="mailto:sneakerlab@email.com" className="contact-link">
                            ✉️ Email: sneakerlab@email.com
                        </a>
                        <a href="https://instagram.com/sneakerlab" target="_blank" rel="noopener noreferrer" className="contact-link">
                            📷 Instagram: @sneakerlab
                        </a>
                    </div>
                    
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} SneakLab. Todos os direitos reservados.
                    </p>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap');
                
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
                
                .footer-brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    margin-bottom: 0.5rem;
                }
                
                .logo-text-creative {
                    font-family: 'Rubik Glitch', system-ui;
                    font-size: 2rem;
                    font-weight: 400;
                    letter-spacing: 2px;
                    background: linear-gradient(135deg, #fff 0%, #ccc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    transition: all 0.3s ease;
                    text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
                }
                
                .logo-text-colored {
                    font-family: 'Rubik Glitch', system-ui;
                    font-size: 2rem;
                    font-weight: 400;
                    letter-spacing: 2px;
                    transition: all 0.3s ease;
                    text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
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
                    
                    .logo-text-creative,
                    .logo-text-colored {
                        font-size: 1.8rem;
                        letter-spacing: 1px;
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
                }
                
                @media (max-width: 480px) {
                    .footer {
                        padding: 1.25rem 0.75rem;
                    }
                    
                    .footer-content {
                        gap: 1.25rem;
                    }
                    
                    .logo-text-creative,
                    .logo-text-colored {
                        font-size: 1.5rem;
                    }
                    
                    .contact-link {
                        font-size: 0.85rem;
                        padding: 0.4rem 0.6rem;
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