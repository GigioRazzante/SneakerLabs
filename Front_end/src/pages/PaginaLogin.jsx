import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImagemTenis from '../assets/ImgPagLogin.png';

const PaginaLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const usuariosValidos = [
        { email: 'usuario@sneaklab.com', password: 'senha123' },
        { email: 'teste@email.com', password: '123' },
        { email: 'admin@sneaklab.com', password: 'admin' },
        { email: 'AdminTest', password: '1234' },
    ];

    const handleLogin = (e) => {
        e.preventDefault();

        const usuarioEncontrado = usuariosValidos.find(
            (user) => user.email === email && user.password === password
        );

        if (usuarioEncontrado) {
            console.log('Login bem-sucedido!');
            alert('Login realizado com sucesso! 🎉');
            navigate('/home'); // MUDANÇA AQUI
        } else {
            console.log('Credenciais inválidas.');
            alert('Credenciais inválidas. Por favor, tente novamente.');
        }
    };

    return (
        // ... (o restante do seu código JSX)
        <>
            <style>
                {`
                .login-main-container {
                    display: flex;
                    min-height: 100vh;
                    font-family: Arial, sans-serif;
                    background-color: #fff;
                }

                .login-left-div {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                    text-align: center;
                }
                
                .login-logo {
                    font-size: 2.5rem;
                    font-weight: bold;
                }

                .login-logo-black {
                    color: #000;
                }

                .login-logo-orange {
                    color: #FF9D00;
                }

                .sneaker-image {
                    max-width: 100%;
                    height: auto;
                    margin-top: 2rem;
                }
                
                .text-slogan-1 {
                    font-size: 2.25rem;
                    font-weight: bold;
                    color: #FF9D00;
                    margin-top: 2rem;
                }

                .text-slogan-2 {
                    color: #666;
                    margin-top: 0.5rem;
                }

                .login-right-div {
                    flex: 1;
                    background-color: #FF9D00;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem;
                    color: #fff;
                }

                .login-form-container {
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }

                .text-login-slogan {
                    font-size: 2.25rem;
                    font-weight: bold;
                    margin-bottom: 2rem;
                }

                .input-group {
                    margin-bottom: 1.5rem;
                }

                .input-group label {
                    display: block;
                    text-align: left;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }

                .input-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: none;
                    border-bottom: 2px solid #fff;
                    background-color: transparent;
                    color: #fff;
                    outline: none;
                }
                
                .input-group input::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .login-button {
                    width: 100%;
                    padding: 1rem;
                    background-color: #fff;
                    border: none;
                    border-radius: 9999px;
                    color: #FF9D00;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                
                .login-button:hover {
                    background-color: #f0f0f0;
                }

                .register-link-text {
                    margin-top: 1.5rem;
                    color: #fff;
                }

                .register-link {
                    color: #fff;
                    font-weight: bold;
                    text-decoration: underline;
                }
                
                @media (max-width: 768px) {
                    .login-main-container {
                        flex-direction: column;
                    }
                    .login-left-div {
                        padding: 1rem;
                    }
                    .text-slogan-1, .text-login-slogan {
                        font-size: 1.75rem;
                    }
                }
                `}
            </style>
            <div className="login-main-container">
                <div className="login-left-div">
                    <h1 className="login-logo">
                        <span className="login-logo-black">SNEAK</span>
                        <span className="login-logo-orange">LAB</span>
                    </h1>
                    <img 
                        src={ImagemTenis}
                        alt="Ilustração de um par de tênis"
                        className="sneaker-image"
                    />
                    <h2 className="text-slogan-1">
                        O tênis que você sempre quis, criado por você.
                    </h2>
                    <p className="text-slogan-2">
                        Monte seu tênis único, e não se preocupe, ninguém conseguirá um igual!
                    </p>
                </div>
                <div className="login-right-div">
                    <div className="login-form-container">
                        <h2 className="text-login-slogan">
                            Entrar & Conectar-<br />se aos tênis mais exclusivos!
                        </h2>
                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <label htmlFor="email">Usuário</label>
                                <input
                                    type="text"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="NomeUsuario"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Senha</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                />
                            </div>
                            <div className="remember-me">
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember" style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>Lembre-me</label>
                            </div>
                            <button type="submit" className="login-button">
                                Entrar
                            </button>
                        </form>
                        <p className="register-link-text">
                            Não possui Cadastro? <Link to="/cadastro" className="register-link">clique aqui</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaginaLogin;