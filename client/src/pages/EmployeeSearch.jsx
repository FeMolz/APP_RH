import React, { useState, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import './EmployeeSearch.css';
import { FaSearch } from 'react-icons/fa';

const EmployeeSearch = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFuncionarios();
    }, []);

    const fetchFuncionarios = async () => {
        setLoading(true);
        try {
            const data = await funcionariosService.getFuncionarios();
            setFuncionarios(data);
        } catch (err) {
            console.error("Error fetching funcionarios:", err);
            setError("Falha ao carregar funcionários.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredFuncionarios = funcionarios.filter(func =>
        func.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (func.cargo?.nome_cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (func.empresa || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="employee-search-dashboard">
            <div className="search-hero">
                <h1>Busca de Colaboradores</h1>
                <div className="big-search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquise por nome, cargo ou empresa..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="big-search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Carregando...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome Completo</th>
                                <th>Cargo</th>
                                <th>Empresa</th>
                                <th>Admissão</th>
                                <th>Formação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFuncionarios.length > 0 ? (
                                filteredFuncionarios.map(func => (
                                    <tr key={func.id}>
                                        <td>
                                            <div className="user-cell">
                                                {func.nome_completo}
                                            </div>
                                        </td>
                                        <td>{func.cargo?.nome_cargo || '-'}</td>
                                        <td><span className="empresa-badge">{func.empresa}</span></td>
                                        <td>{formatDate(func.data_admissao)}</td>
                                        <td>
                                            {func.formacoes && func.formacoes.length > 0 ? (
                                                <ul className="formacoes-list">
                                                    {func.formacoes.map(f => (
                                                        <li key={f.id}>
                                                            {f.nome_formacao} ({f.nivel})
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-results">Nenhum colaborador encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EmployeeSearch;
