import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import MeusPedidos from './MeusPedidos'; 
import RastrearPedido from './RastrearPedido';

const VIEWS = {
    PROFILE: 'profile',
    ORDERS: 'orders',
    TRACKING: 'tracking'
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            console.warn('Data inválida recebida:', dateString);
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error, 'Data recebida:', dateString);
        return '';
    }
};

const AlterarDadosUsuario = () => {
    const { user, updateUser, loading: authLoading } = useAuth();
    const { primaryColor, updatePrimaryColor } = useTheme();
    const navigate = useNavigate();
    
    const [userData, setUserData] = useState({
        email: '',
        username: '',
        birthdate: '',
        phone: '',
        profileColor: primaryColor,
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [activeView, setActiveView] = useState(VIEWS.PROFILE);
    const [saving, setSaving] = useState(false);

    const colorOptions = ['#FF9D00', '#1A1A1A', '#007BFF', '#28A745', '#DC3545', '#6F42C1'];

    useEffect(() => {
        if (user) {
            console.log('📅 Dados do usuário recebidos:', {
                data_nascimento: user.data_nascimento,
                cor_perfil: user.cor_perfil,
                tipo: typeof user.data_nascimento
            });
            
            setUserData({
                email: user.email || '',
                username: user.nome_usuario || '',
                birthdate: formatDateForInput(user.data_nascimento),
                phone: user.telefone || '',
                profileColor: user.cor_perfil || primaryColor,
            });
        }
    }, [user, primaryColor]);

    const handleAccessOrders = () => {
        setActiveView(VIEWS.ORDERS);
        console.log('>>> Ação: Navegar para Meus Pedidos');
    };

    const handleTrackOrder = () => {
        // Mude para navegar para página separada em vez de mudar view
        navigate('/rastreamento');
        console.log('>>> Ação: Navegar para página de rastreamento');
    };

    const handleBackToProfile = () => {
        setActiveView(VIEWS.PROFILE);
    };

    if (authLoading) {
        return (
            <div className="profile-wrapper">
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <p>Carregando dados do usuário...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-wrapper">
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'red' }}>
                    <p>Usuário não logado</p>
                    <button onClick={() => navigate('/login')} className="secondary-button">
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

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
                        <h3 className="section-title" style={{ marginTop: '0' }}>Dados Pessoais</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">Nome de Usuário</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    value={userData.username} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={userData.email} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    disabled 
                                />
                                <p className="help-text">O email não pode ser alterado por aqui</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="birthdate" className="form-label">Data de Nascimento</label>
                                <input 
                                    type="date" 
                                    id="birthdate" 
                                    value={userData.birthdate} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    required 
                                />
                                <p className="help-text">
                                    Valor atual: {userData.birthdate || 'Não definido'}
                                </p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">Telefone</label>
                                <input 
                                    type="tel" 
                                    id="phone" 
                                    value={userData.phone} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="(99) 99999-9999" 
                                    required 
                                />
                            </div>
                        </div>

                        <h3 className="section-title">Alterar Senha</h3>
                        <p className="help-text">Preencha ambos os campos apenas se quiser alterar sua senha</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="currentPassword" className="form-label">Senha Atual</label>
                                <input 
                                    type="password" 
                                    id="currentPassword" 
                                    value={currentPassword} 
                                    onChange={(e) => setCurrentPassword(e.target.value)} 
                                    className="form-input" 
                                    placeholder="********" 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">Nova Senha</label>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    className="form-input" 
                                    placeholder="********" 
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                                type="submit" 
                                className="save-button" 
                                style={{ backgroundColor: userData.profileColor }}
                                disabled={saving}
                            >
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                );
        }
    };

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

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const { email, profileColor, ...dataToUpdate } = userData;
            
            console.log('📤 Enviando dados para atualização:', {
                nome_usuario: dataToUpdate.username,
                data_nascimento: dataToUpdate.birthdate,
                telefone: dataToUpdate.phone,
                cor_perfil: profileColor
            });

            const response = await fetch(`http://localhost:3001/api/cliente/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome_usuario: dataToUpdate.username,
                    data_nascimento: dataToUpdate.birthdate,
                    telefone: dataToUpdate.phone,
                    cor_perfil: profileColor
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                updateUser({
                    nome_usuario: dataToUpdate.username,
                    data_nascimento: dataToUpdate.birthdate,
                    telefone: dataToUpdate.phone,
                    cor_perfil: profileColor
                });
                
                updatePrimaryColor(profileColor);
                
                console.log("Dados de usuário atualizados:", userData);
                alert('Dados atualizados com sucesso! O tema foi aplicado em toda a aplicação.');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                throw new Error('Erro ao atualizar dados');
            }

        } catch (err) {
            console.error('Erro ao salvar dados:', err);
            alert('Erro ao atualizar dados. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <style>{`
                /* Container Principal - Adaptado para página já existente */
                .profile-wrapper {
                    max-width: 900px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                
                /* Profile Card Container */
                .profile-card {
                    background: white;
                    border-radius: 1.5rem;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                    padding: 2.5rem;
                    position: relative;
                    overflow: hidden;
                    margin: 2rem auto;
                }
                
                /* Header Bar (agora dentro do card) */
                .card-header-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 8px;
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                }
                
                /* Profile Header */
                .profile-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    position: relative;
                }
                
                .profile-main-title {
                    font-size: 2.8rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, var(--primary-color) 0%, #ffb347 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .profile-subtitle {
                    font-size: 1.1rem;
                    color: #666;
                    max-width: 600px;
                    margin: 0 auto 2rem auto;
                    line-height: 1.6;
                }
                
                /* Avatar Section */
                .avatar-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    padding: 2rem;
                    background: rgba(var(--primary-color-rgb), 0.05);
                    border-radius: 1rem;
                    border: 1px solid rgba(var(--primary-color-rgb), 0.1);
                }
                
                .avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                    border: 4px solid;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .avatar:hover {
                    transform: scale(1.05);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.2);
                }
                
                /* Color Selector */
                .color-selector {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .color-option {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                
                .color-option:hover {
                    transform: scale(1.15);
                }
                
                .color-option.selected {
                    transform: scale(1.2);
                    border: 3px solid white;
                    outline: 2px solid var(--primary-color);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                
                /* Form Grid */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.8rem;
                    margin-bottom: 2rem;
                }
                
                @media (min-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                
                /* Form Elements - CORRIGIDAS CORES DOS TEXTOS */
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                
                .form-label {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    text-align: left;
                    font-size: 1rem;
                }
                
                .form-input {
                    padding: 0.9rem 1rem;
                    border: 2px solid #f0f0f0;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background: #fafafa;
                    color: #333; /* CORRIGIDO: Texto sempre escuro */
                }
                
                .form-input::placeholder {
                    color: #888; /* CORRIGIDO: Placeholder cinza */
                }
                
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.15);
                    transform: translateY(-1px);
                    color: #333; /* CORRIGIDO: Texto escuro ao focar */
                }
                
                .form-input:disabled {
                    background-color: #f5f5f5;
                    cursor: not-allowed;
                    opacity: 0.7;
                    color: #666; /* CORRIGIDO: Texto cinza quando desabilitado */
                }
                
                /* Estilo específico para input type="date" */
                .form-input[type="date"] {
                    color: #333;
                }
                
                .form-input[type="date"]:disabled {
                    color: #666;
                }
                
                .help-text {
                    font-size: 0.85rem;
                    color: #888;
                    margin-top: 0.35rem;
                    line-height: 1.4;
                }
                
                /* Section Titles */
                .section-title {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #333;
                    margin-top: 2.5rem;
                    margin-bottom: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid #f0f0f0;
                    position: relative;
                }
                
                .section-title::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: -2px;
                    width: 60px;
                    height: 4px;
                    background: var(--primary-color);
                    border-radius: 2px;
                }
                
                /* Save Button */
                .save-button {
                    width: 100%;
                    max-width: 350px;
                    padding: 1.1rem 2rem;
                    color: white;
                    border: none;
                    border-radius: 1rem;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 2.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                .save-button:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                    filter: brightness(1.05);
                }
                
                .save-button:active:not(:disabled) {
                    transform: translateY(-1px);
                }
                
                .save-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }
                
                /* Secondary Buttons */
                .secondary-button-group {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    margin-top: 3rem;
                    padding-top: 2.5rem;
                    border-top: 2px dashed var(--primary-color);
                    align-items: center;
                }
                
                .secondary-button {
                    width: 100%;
                    max-width: 350px;
                    padding: 1rem 2rem;
                    background: transparent;
                    color: #333;
                    border: 2px solid #333;
                    border-radius: 1rem;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .secondary-button:hover {
                    background: #333;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                }
                
                .secondary-button:active {
                    transform: translateY(0);
                }
                
                /* Back Button */
                .back-button {
                    background: none;
                    border: none;
                    color: var(--primary-color);
                    cursor: pointer;
                    padding: 0.5rem 0;
                    margin-bottom: 1.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .back-button:hover {
                    color: var(--primary-color-dark);
                    transform: translateX(-3px);
                }
                
                /* 🔥 RESPONSIVIDADE AVANÇADA - IGUAL AO CATÁLOGO */
                
                /* Tablets Grandes */
                @media (max-width: 1200px) {
                    .profile-wrapper {
                        max-width: 95%;
                    }
                    
                    .profile-main-title {
                        font-size: 2.5rem;
                    }
                }
                
                /* Tablets */
                @media (max-width: 968px) {
                    .profile-wrapper {
                        padding: 0 1rem;
                    }
                    
                    .profile-card {
                        padding: 2rem;
                    }
                    
                    .profile-main-title {
                        font-size: 2.3rem;
                    }
                    
                    .section-title {
                        font-size: 1.4rem;
                    }
                    
                    .avatar {
                        width: 90px;
                        height: 90px;
                        font-size: 2.2rem;
                    }
                    
                    .avatar-section {
                        padding: 1.5rem;
                    }
                    
                    .color-option {
                        width: 28px;
                        height: 28px;
                    }
                    
                    .save-button {
                        max-width: 300px;
                        padding: 1rem 1.8rem;
                    }
                }
                
                /* Tablets Pequenos e Mobile Grande (768px) - IGUAL CATÁLOGO */
                @media (max-width: 768px) {
                    .profile-wrapper {
                        padding: 0 0.8rem;
                    }
                    
                    .profile-card {
                        padding: 1.5rem;
                        margin: 1rem auto;
                    }
                    
                    .profile-header {
                        margin-bottom: 2rem;
                    }
                    
                    .profile-main-title {
                        font-size: 2rem;
                    }
                    
                    .profile-subtitle {
                        font-size: 1rem;
                        padding: 0;
                        margin: 0 auto 1.5rem auto;
                    }
                    
                    .form-grid {
                        gap: 1.5rem;
                    }
                    
                    .form-input {
                        padding: 0.8rem;
                        font-size: 0.95rem;
                    }
                    
                    .section-title {
                        font-size: 1.3rem;
                        margin-top: 2rem;
                    }
                    
                    .avatar {
                        width: 80px;
                        height: 80px;
                        font-size: 2rem;
                    }
                    
                    .avatar-section {
                        margin-bottom: 2rem;
                        padding: 1.2rem;
                    }
                    
                    .secondary-button-group {
                        margin-top: 2.5rem;
                        padding-top: 2rem;
                    }
                    
                    .secondary-button {
                        max-width: 300px;
                        padding: 0.9rem 1.5rem;
                    }
                }
                
                /* Mobile Médio (640px) - IGUAL CATÁLOGO */
                @media (max-width: 640px) {
                    .profile-wrapper {
                        padding: 0 0.5rem;
                    }
                    
                    .profile-card {
                        padding: 1.2rem;
                        border-radius: 1.2rem;
                    }
                    
                    .profile-main-title {
                        font-size: 1.8rem;
                    }
                    
                    .profile-subtitle {
                        font-size: 0.95rem;
                    }
                    
                    .avatar {
                        width: 70px;
                        height: 70px;
                        font-size: 1.8rem;
                    }
                    
                    .color-option {
                        width: 26px;
                        height: 26px;
                    }
                    
                    .color-selector {
                        gap: 0.6rem;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .save-button {
                        max-width: 100%;
                        padding: 1rem;
                        font-size: 1rem;
                    }
                    
                    .secondary-button {
                        max-width: 100%;
                        padding: 0.9rem 1.2rem;
                        font-size: 0.95rem;
                    }
                }
                
                /* Mobile Pequeno (480px) - IGUAL CATÁLOGO */
                @media (max-width: 480px) {
                    .profile-wrapper {
                        padding: 0 0.3rem;
                    }
                    
                    .profile-card {
                        padding: 1rem;
                        border-radius: 1rem;
                        margin: 0.5rem auto;
                    }
                    
                    .profile-main-title {
                        font-size: 1.6rem;
                    }
                    
                    .profile-subtitle {
                        font-size: 0.9rem;
                        margin-bottom: 1rem;
                    }
                    
                    .avatar-section {
                        margin-bottom: 1.5rem;
                        padding: 1rem;
                    }
                    
                    .avatar {
                        width: 60px;
                        height: 60px;
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                    }
                    
                    .form-grid {
                        gap: 1rem;
                    }
                    
                    .section-title {
                        font-size: 1.2rem;
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                    }
                    
                    .section-title::before {
                        width: 50px;
                        height: 3px;
                    }
                    
                    .form-label {
                        font-size: 0.95rem;
                        margin-bottom: 0.3rem;
                    }
                    
                    .form-input {
                        padding: 0.7rem;
                        font-size: 0.9rem;
                    }
                    
                    .help-text {
                        font-size: 0.8rem;
                    }
                    
                    .save-button {
                        margin-top: 2rem;
                        padding: 0.9rem;
                        border-radius: 0.8rem;
                    }
                    
                    .secondary-button-group {
                        margin-top: 2rem;
                        padding-top: 1.5rem;
                        gap: 1rem;
                    }
                }
                
                /* Mobile Muito Pequeno (360px) - IGUAL CATÁLOGO */
                @media (max-width: 360px) {
                    .profile-main-title {
                        font-size: 1.4rem;
                    }
                    
                    .section-title {
                        font-size: 1.1rem;
                    }
                    
                    .avatar {
                        width: 50px;
                        height: 50px;
                        font-size: 1.3rem;
                        border-width: 3px;
                    }
                    
                    .color-option {
                        width: 24px;
                        height: 24px;
                    }
                    
                    .save-button {
                        font-size: 0.95rem;
                        padding: 0.8rem;
                    }
                    
                    .secondary-button {
                        font-size: 0.9rem;
                        padding: 0.8rem;
                    }
                }
            `}</style>

            <div className="profile-wrapper">
                <div className="profile-card">
                    <div className="card-header-bar" style={{ backgroundColor: userData.profileColor }}></div>
                    
                    <header className="profile-header">
                        <h1 className="profile-main-title">
                            {activeView === VIEWS.PROFILE ? "Configurações do Perfil" : activeView === VIEWS.ORDERS ? "Seus Pedidos" : "Rastreamento"}
                        </h1>
                        {activeView === VIEWS.PROFILE && (
                            <p className="profile-subtitle">
                                Gerencie suas informações pessoais, escolha sua cor preferida e atualize suas configurações
                            </p>
                        )}
                    </header>

                    {activeView !== VIEWS.PROFILE && (
                        <button onClick={handleBackToProfile} className="back-button">
                            ← Voltar para Configurações
                        </button>
                    )}

                    {activeView === VIEWS.PROFILE && (
                        <>
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
                                <p className="help-text">Escolha a cor do seu perfil (será aplicada em toda a aplicação)</p>
                            </div>
                        </>
                    )}

                    {renderContent()}

                    {activeView === VIEWS.PROFILE && (
                        <div className="secondary-button-group">
                            <button type="button" onClick={handleAccessOrders} className="secondary-button">
                                Acessar Meus Pedidos
                            </button>
                            <button 
                                type="button" 
                                onClick={handleTrackOrder} 
                                className="secondary-button"
                            >
                                Rastrear um Pedido
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AlterarDadosUsuario;