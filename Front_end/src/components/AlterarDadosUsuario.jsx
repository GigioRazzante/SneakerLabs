import React, { useState } from 'react';

const MOCK_USER_DATA = {
    email: 'user@sneakerlab.com',
    password: 'senhaSegura123', 
    username: 'UsuarioSneakerLab',
    birthdate: '1995-05-20',
    phone: '21987654321',
    profileColor: '#FF9D00',
};

const AlterarDadosUsuario = () => {
    const [userData, setUserData] = useState(MOCK_USER_DATA);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
        console.log('Dados atualizados com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
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
                <div className="card-header-bar"></div>
                
                <div className="profile-title-section">
                    <h1 className="profile-main-title">Configurações do Perfil</h1>
                </div>

                {/* Seção do Avatar */}
                <div className="avatar-section">
                    <div 
                        className="avatar"
                        style={{ backgroundColor: userData.profileColor }}
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

                {/* Formulário */}
                <form onSubmit={handleSave}>
                    <div className="form-grid">
                        {/* Nome de Usuário */}
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

                        {/* Email */}
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

                        {/* Data de Nascimento */}
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
                        </div>

                        {/* Telefone */}
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

                    {/* Seção de Senha */}
                    <h3 className="section-title">Alterar Senha</h3>
                    <p className="help-text">Preencha ambos os campos apenas se quiser alterar sua senha</p>

                    <div className="form-grid">
                        {/* Senha Atual */}
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

                        {/* Nova Senha */}
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

                    {/* Botão Salvar */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" className="save-button">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AlterarDadosUsuario;