import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImagemTenis from '../assets/ImgPagLogin.png';

const API_BASE_URL = 'https://sneakerslab-backend.onrender.com';

const PaginaCadastro = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    

    const handleCadastro = async (e) => {
        e.preventDefault();

        if (!email || !password || !username || !birthdate || !phone) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    senha: password,
                    nome_usuario: username,
                    data_nascimento: birthdate,
                    telefone: phone,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Resposta do Cadastro:', data);
                alert('Cadastro realizado com sucesso! Bem-vindo ao SneakLab! 🎉');
                navigate('/login');
            } else {
                alert(`Falha no cadastro: ${data.error || 'Erro desconhecido. Verifique se o servidor está rodando.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou no servidor:', error);
            alert('Não foi possível conectar ao servidor. Verifique a conexão ou tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Sedgwick+Ave+Display&display=swap');
                
                .login-main-container {
                    display: flex;
                    min-height: 100vh;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
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
                    font-weight: 400;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                }

                .login-logo-creative {
                    font-family: 'Rubik Glitch', system-ui;
                    font-size: 2.5rem;
                    font-weight: 400;
                    letter-spacing: 2px;
                    background: linear-gradient(135deg, #000 0%, #333 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    transition: all 0.3s ease;
                    text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
                }

                .login-logo-colored {
                    font-family: 'Rubik Glitch', system-ui;
                    font-size: 2.5rem;
                    font-weight: 400;
                    letter-spacing: 2px;
                    color: #FF9D00;
                    transition: all 0.3s ease;
                    text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
                }

                .sneaker-image {
                    max-width: 100%;
                    height: auto;
                    margin-top: 2rem;
                }
                
                .text-slogan-1 {
                    font-size: 2rem;
                    color: #FF9D00;
                    font-family: 'Sedgwick Ave Display', cursive;
                    margin-top: 1.5rem;
                    line-height: 1.2;
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
                    letter-spacing: 1px;
                }

                .text-slogan-2 {
                    color: #666;
                    margin-top: 0.5rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
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
                    font-weight: 700;
                    margin-bottom: 2rem;
                    line-height: 1.2;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                }

                .input-group {
                    margin-bottom: 1.5rem;
                }

                .input-group label {
                    display: block;
                    text-align: left;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                }

                .input-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: none;
                    border-bottom: 2px solid #fff;
                    background-color: transparent;
                    color: #fff;
                    outline: none;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                    font-size: 1rem;
                }
                
                .input-group input::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                }

                .input-group input[type="date"] {
                    color: #fff;
                }

                .input-group input[type="date"]::-webkit-datetime-edit {
                    color: #fff;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                }

                .login-button {
                    width: 100%;
                    padding: 1rem;
                    background-color: #fff;
                    border: none;
                    border-radius: 9999px;
                    color: #FF9D00;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.3s, opacity 0.3s;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                    font-size: 1rem;
                }
                
                .login-button:hover:not(:disabled) {
                    background-color: #f0f0f0;
                }
                
                .login-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .register-link-text {
                    margin-top: 1.5rem;
                    color: #fff;
                    font-size: 0.95rem;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                }

                .register-link {
                    color: #fff;
                    font-weight: 600;
                    text-decoration: underline;
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                }
                
                @media (max-width: 768px) {
                    .login-main-container {
                        flex-direction: column;
                    }
                    .login-left-div {
                        padding: 1rem;
                    }
                    .text-login-slogan {
                        font-size: 1.75rem;
                    }
                    .login-logo-creative,
                    .login-logo-colored {
                        font-size: 2rem;
                    }
                    .text-slogan-1 {
                        font-size: 1.6rem;
                    }
                    .text-slogan-2 {
                        font-size: 0.95rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .login-logo-creative,
                    .login-logo-colored {
                        font-size: 1.8rem;
                    }
                    .text-slogan-1 {
                        font-size: 1.4rem;
                    }
                    .text-login-slogan {
                        font-size: 1.5rem;
                    }
                }
                `}
            </style>
            <div className="login-main-container">
                <div className="login-left-div">
                    <h1 className="login-logo">
                        <span className="login-logo-creative">Sneak</span>
                        <span className="login-logo-colored">Lab</span>
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
                            Cadastre-se e Crie seu Tênis Único!
                        </h2>
                        <form onSubmit={handleCadastro}>
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    required
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
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="username">Nome de Usuário</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nome de Usuário"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="birthdate">Data de Nascimento</label>
                                <input
                                    type="date"
                                    id="birthdate"
                                    value={birthdate}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="phone">Telefone (DDD)</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(99) 99999-9999"
                                    required
                                />
                            </div>
                            
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </form>
                        <p className="register-link-text">
                            Já possui uma conta? <Link to="/login" className="register-link">clique aqui</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaginaCadastro;