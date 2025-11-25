import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx'; // 🎨 NOVO IMPORT
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
    const { primaryColor, updatePrimaryColor } = useTheme(); // 🎨 HOOK DO TEMA
    const navigate = useNavigate();
    
    const [userData, setUserData] = useState({
        email: '',
        username: '',
        birthdate: '',
        phone: '',
        profileColor: primaryColor, // 🎨 USA COR DO TEMA
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
                profileColor: user.cor_perfil || primaryColor, // 🎨 USA COR DO TEMA
            });
        }
    }, [user, primaryColor]); // 🎨 ADICIONA primaryColor COMO DEPENDÊNCIA

    const handleAccessOrders = () => {
        setActiveView(VIEWS.ORDERS);
        console.log('>>> Ação: Navegar para Meus Pedidos');
    };

    const handleTrackOrder = () => {
        setActiveView(VIEWS.TRACKING);
        console.log('>>> Ação: Navegar para Rastreamento');
    };

    const handleBackToProfile = () => {
        setActiveView(VIEWS.PROFILE);
    };

    if (authLoading) {
        return (
            <div className="profile-card-container">
                <div className="card-header-bar" style={{ backgroundColor: primaryColor }}></div> {/* 🎨 COR DINÂMICA */}
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Carregando dados do usuário...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-card-container">
                <div className="card-header-bar" style={{ backgroundColor: primaryColor }}></div> {/* 🎨 COR DINÂMICA */}
                <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
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
                
                // ✅ ATUALIZA O CONTEXT DO USUÁRIO
                updateUser({
                    nome_usuario: dataToUpdate.username,
                    data_nascimento: dataToUpdate.birthdate,
                    telefone: dataToUpdate.phone,
                    cor_perfil: profileColor
                });
                
                // 🎨 ATUALIZA O TEMA GLOBALMENTE
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
            <style>
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
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                    transition: background-color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }

                .profile-title-section {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .profile-main-title {
                    font-size: 2.2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }

                .profile-subtitle {
                    font-size: 1.1rem;
                    color: #666;
                    margin-bottom: 1rem;
                }

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
                    border: 4px solid;
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
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
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
                }

                .color-option:hover {
                    transform: scale(1.1);
                }

                .color-option.selected {
                    transform: scale(1.2);
                    border: 2px solid var(--primary-color, #FF9D00); /* 🎨 COR DINÂMICA */
                    outline: 2px solid var(--primary-color, #FF9D00); /* 🎨 COR DINÂMICA */
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
                    border-color: var(--primary-color, #FF9D00); /* 🎨 COR DINÂMICA */
                    box-shadow: 0 0 0 2px var(--primary-light, rgba(255, 157, 0, 0.2)); /* 🎨 COR LIGHT DINÂMICA */
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
                    color: white;
                    border: none;
                    border-radius: 2rem;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease; /* 🎨 TRANSITION SUAVE */
                    margin-top: 2rem;
                }

                .save-button:hover:not(:disabled) {
                    transform: scale(1.02);
                    filter: brightness(0.9);
                }

                .save-button:active {
                    transform: scale(0.98);
                }

                .save-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
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
                    transition: all 0.3s ease;
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

                .back-button {
                    background: none;
                    border: none;
                    color: #007BFF;
                    cursor: pointer;
                    padding: 0;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                    transition: color 0.3s ease; /* 🎨 TRANSITION SUAVE */
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
                    
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }
                `}
            </style>

            <div className="profile-card-container">
                <div className="card-header-bar" style={{ backgroundColor: userData.profileColor }}></div>
                
                <div className="profile-title-section">
                    <h1 className="profile-main-title" style={{ color: userData.profileColor }}>
                        {activeView === VIEWS.PROFILE ? "Configurações do Perfil" : activeView === VIEWS.ORDERS ? "Seus Pedidos" : "Rastreamento"}
                    </h1>
                </div>

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
                            <p className="help-text">Escolha a cor do seu perfil (será aplicada em toda a aplicação)</p> {/* 🎨 TEXTO ATUALIZADO */}
                        </div>
                    </>
                )}

                {renderContent()}

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