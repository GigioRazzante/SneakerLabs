import React from 'react';

// Este componente é o Rodapé simples (Footer), focado apenas em contato e marca.
// O nome foi alterado para 'Footer' para coincidir com o nome do arquivo.
const Footer = () => {
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
                    border-top: 4px solid #FF9D00; /* Linha laranja para destaque */
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
                    transition: color 0.2s;
                }

                .footer-contact a:hover {
                    color: #FF9D00;
                    text-decoration: underline;
                }
                
                .footer-copyright {
                    margin-top: 0.5rem;
                    font-size: 0.8rem;
                    color: #999999;
                }

                .footer-logo-orange {
                    color: #FF9D00;
                    font-weight: bold;
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
                    }
                }
                `}
            </style>

            <div className="footer-minimal-content">
                
                <div className="footer-contact">
                    <a href="mailto:sneakerlab@email.com">Email: sneakerlab@email.com</a>
                    {/* Pode-se usar um link simples para uma conta de mídia social */}
                    <a href="https://instagram.com/sneakerlab" target="_blank" rel="noopener noreferrer">Instagram: @sneakerlab</a>
                </div>

                {/* ATRIBUIÇÃO BÁSICA DA MARCA */}
                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} <span className="footer-logo-orange">SNEAKLAB</span>. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
