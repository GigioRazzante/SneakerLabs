import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTAÇÕES DOS NOVOS COMPONENTES
import MeusPedidos from './MeusPedidos'; 
import RastrearPedido from './RastrearPedido'; // Assumindo que este é o nome real do 2º componente

const MOCK_USER_DATA = {
    email: 'user@sneakerlab.com',
    password: 'senhaSegura123', 
    username: 'UsuarioSneakerLab',
    birthdate: '1995-05-20',
    phone: '21987654321',
    profileColor: '#FF9D00',
};

// Constantes para as Views
const VIEWS = {
    PROFILE: 'profile',
    ORDERS: 'orders',
    TRACKING: 'tracking'
};

const AlterarDadosUsuario = () => {
    const [userData, setUserData] = useState(MOCK_USER_DATA);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    // 2. ESTADO PARA GERENCIAR A VISUALIZAÇÃO ATIVA
    const [activeView, setActiveView] = useState(VIEWS.PROFILE);

    const colorOptions = ['#FF9D00', '#1A1A1A', '#007BFF', '#28A745', '#DC3545', '#6F42C1'];

    const handleChange = (e) => {
        const { id, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleColorChange = (color) => {
        setUserData(prev => ({
            ...prev,
            profileColor: color
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Dados de usuário a serem salvos:", userData);
        console.log("Nova Senha:", newPassword);
        alert('Dados atualizados com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
    };

    // 3. FUNÇÕES PARA OS NOVOS BOTÕES DE NAVEGAÇÃO (ATUALIZADAS)
    const handleAccessOrders = () => {
        setActiveView(VIEWS.ORDERS); // Muda para a view Meus Pedidos
        console.log('>>> Ação: Navegar para Meus Pedidos');
    };

    const handleTrackOrder = () => {
        setActiveView(VIEWS.TRACKING); // Muda para a view Rastrear Pedido
        console.log('>>> Ação: Navegar para Rastreamento');
    };

    const handleBackToProfile = () => {
        setActiveView(VIEWS.PROFILE); // Volta para a tela principal de Perfil
    };


    // 4. LÓGICA DE RENDERIZAÇÃO CONDICIONAL
    const renderContent = () => {
        switch (activeView) {
            case VIEWS.ORDERS:
                return <MeusPedidos />;
            case VIEWS.TRACKING:
                return <RastrearPedido />;
            case VIEWS.PROFILE:
            default:
                return (
                    <form onSubmit={handleSave}>
                        {/* Seu formulário existente de Alterar Dados (Form-Grid, Senha, Botão Salvar) */}
                        <h3 className="section-title" style={{ marginTop: '0' }}>Dados Pessoais</h3>
                        <div className="form-grid">
                            {/* Nome de Usuário */}
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">Nome de Usuário</label>
                                <input type="text" id="username" value={userData.username} onChange={handleChange} className="form-input" required />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" id="email" value={userData.email} onChange={handleChange} className="form-input" disabled />
                                <p className="help-text">O email não pode ser alterado por aqui</p>
                            </div>

                            {/* Data de Nascimento */}
                            <div className="form-group">
                                <label htmlFor="birthdate" className="form-label">Data de Nascimento</label>
                                <input type="date" id="birthdate" value={userData.birthdate} onChange={handleChange} className="form-input" required />
                            </div>

                            {/* Telefone */}
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Telefone</label>
                                <input type="tel" id="phone" value={userData.phone} onChange={handleChange} className="form-input" placeholder="(99) 99999-9999" required />
                            </div>
                        </div>

                        {/* Seção de Senha */}
                        <h3 className="section-title">Alterar Senha</h3>
                        <p className="help-text">Preencha ambos os campos apenas se quiser alterar sua senha</p>

                        <div className="form-grid">
                            {/* Senha Atual */}
                            <div className="form-group">
                                <label htmlFor="currentPassword" className="form-label">Senha Atual</label>
                                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-input" placeholder="********" />
                            </div>

                            {/* Nova Senha */}
                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">Nova Senha</label>
                                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-input" placeholder="********" />
                            </div>
                        </div>

                        {/* Botão Salvar */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button type="submit" className="save-button" style={{ backgroundColor: userData.profileColor }}>
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                );
        }
    };


    // JSX Principal
    return (
        <>
            <style>
                {/* ESTILOS AQUI (MANTIDOS IGUAIS) */}
                {`
                .profile-card-container {
                    position: relative;
                    background: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                    padding: 2.5rem;
                    margin: 1.5rem 0;
                    max-width: 900px;
                    width: 95%;
                }

                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 1.5rem;
                    background: #FF9D00;
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                }

                .profile-title-section {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .profile-main-title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    color: #FF9D00;
                    margin-bottom: 0.5rem;
                }

                .profile-subtitle {
                    font-size: 1.1rem;
                    color: #666;
                    margin-bottom: 1rem;
                }

                /* Estilos específicos para o formulário de perfil */
                .avatar-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    border: 4px solid #FF9D00;
                }

                .color-selector {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .color-option {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .color-option:hover {
                    transform: scale(1.1);
                }

                .color-option.selected {
                    transform: scale(1.2);
                    border: 2px solid #FF9D00;
                    outline: 2px solid #FF9D00; /* Para acessibilidade e destaque */
                    outline-offset: 1px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                @media (min-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    text-align: left;
                }

                .form-input {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    transition: border-color 0.3s, box-shadow 0.3s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #FF9D00;
                    box-shadow: 0 0 0 2px rgba(255, 157, 0, 0.2);
                }

                .form-input:disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                }

                .help-text {
                    font-size: 0.875rem;
                    color: #666;
                    margin-top: 0.25rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #333;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #eee;
                }

                .save-button {
                    width: 100%;
                    max-width: 300px;
                    padding: 1rem 2rem;
                    background: #FF9D00;
                    color: white;
                    border: none;
                    border-radius: 2rem;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-top: 2rem;
                }

                .save-button:hover {
                    background: #e68a00;
                    transform: scale(1.02);
                }

                .save-button:active {
                    transform: scale(0.98);
                }
                
                /* Estilos para os Novos Botões */
                .secondary-button-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid #eee;
                    align-items: center;
                }

                .secondary-button {
                    width: 100%;
                    max-width: 300px;
                    padding: 0.75rem 2rem;
                    background: transparent;
                    color: #1A1A1A;
                    border: 2px solid #1A1A1A;
                    border-radius: 2rem;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .secondary-button:hover {
                    background: #1A1A1A;
                    color: white;
                    transform: scale(1.02);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .secondary-button:active {
                    transform: scale(0.98);
                }

                /* Estilo para botão de voltar */
                .back-button {
                    background: none;
                    border: none;
                    color: #007BFF;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }

                .back-button:hover {
                    text-decoration: underline;
                }


                @media (max-width: 768px) {
                    .profile-card-container {
                        padding: 1.5rem;
                        margin: 1rem 0;
                    }

                    .profile-main-title {
                        font-size: 1.8rem;
                    }

                    .avatar {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                    }
                }
                `}
            </style>

            <div className="profile-card-container">
                <div className="card-header-bar" style={{ backgroundColor: userData.profileColor }}></div>
                
                <div className="profile-title-section">
                    <h1 className="profile-main-title" style={{ color: userData.profileColor }}>
                        {/* Título dinâmico */}
                        {activeView === VIEWS.PROFILE ? "Configurações do Perfil" : activeView === VIEWS.ORDERS ? "Seus Pedidos" : "Rastreamento"}
                    </h1>
                </div>

                {/* Botão Voltar (aparece apenas nas sub-telas) */}
                {activeView !== VIEWS.PROFILE && (
                    <button onClick={handleBackToProfile} className="back-button">
                        ← Voltar para Configurações
                    </button>
                )}


                {activeView === VIEWS.PROFILE && (
                    <>
                        {/* Seção do Avatar (Apenas na tela de Perfil) */}
                        <div className="avatar-section">
                            <div 
                                className="avatar"
                                style={{ backgroundColor: userData.profileColor, borderColor: userData.profileColor }}
                            >
                                {userData.username.charAt(0).toUpperCase()}
                            </div>

                            <div className="color-selector">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleColorChange(color)}
                                        className={`color-option ${userData.profileColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Selecionar cor ${color}`}
                                    />
                                ))}
                            </div>
                            <p className="help-text">Escolha a cor da sua bolinha de perfil</p>
                        </div>
                    </>
                )}


                {/* RENDERIZAÇÃO CONDICIONAL */}
                {renderContent()}


                {/* Grupo de Botões Secundários (Apenas na tela de Perfil) */}
                {activeView === VIEWS.PROFILE && (
                    <div className="secondary-button-group">
                        <button type="button" onClick={handleAccessOrders} className="secondary-button">
                            Acessar Meus Pedidos
                        </button>
                        <button type="button" onClick={handleTrackOrder} className="secondary-button">
                            Rastrear um Pedido
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AlterarDadosUsuario;