import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const Footer = () => {
    const { primaryColor } = useTheme();

    return (
        <>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="brand-name" style={{ color: primaryColor }}>SNEAKLAB</span>
                        <span className="brand-subtitle">Personalize seu estilo</span>
                    </div>
                    
                    <div className="footer-contact">
                        <span className="contact-item">
                            <i className="fas fa-envelope"></i> sneakerlab@email.com
                        </span>
                        <span className="contact-item">
                            <i className="fab fa-instagram"></i> @sneakerlab
                        </span>
                    </div>
                    
                    <div className="footer-copyright">
                        © {new Date().getFullYear()} SneakLab. Todos os direitos reservados.
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sedgwick+Ave+Display&display=swap');
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
                
                .footer {
                    background: rgba(0, 0, 0, 0.9);
                    color: #e0e0e0;
                    padding: 2rem 1rem;
                    border-top: 3px solid ${primaryColor};
                    margin-top: auto;
                    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
                }
                
                .footer-content {
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                
                .footer-brand {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .brand-name {
                    font-family: 'Sedgwick Ave Display', cursive;
                    font-size: 2.2rem;
                    letter-spacing: 1.5px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                }
                
                .brand-subtitle {
                    font-size: 0.9rem;
                    color: #aaa;
                    font-style: italic;
                }
                
                .footer-contact {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #ccc;
                    font-size: 0.95rem;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }
                
                .contact-item i {
                    color: ${primaryColor};
                }
                
                .footer-copyright {
                    color: #888;
                    font-size: 0.8rem;
                    text-align: center;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 1rem;
                    width: 100%;
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
                    .brand-name {
                        font-size: 1.8rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .footer {
                        padding: 1rem;
                    }
                    .brand-name {
                        font-size: 1.5rem;
                    }
                    .contact-item {
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </>
    );
};

export default Footer;