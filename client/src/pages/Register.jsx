import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        role: 'TECNICO' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authService.register(formData);
            navigate('/login'); // Redirect to login after success
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.message || 'Falha ao registrar usuário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Cadastro de Usuário</h2>
                {error && <div className="alert error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                            placeholder="Seu nome"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            name="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            required
                            placeholder="Sua senha"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Tipo de Usuário</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="TECNICO">Técnico</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>
                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                <div className="login-link">
                    Já tem uma conta? <Link to="/login">Faça login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
