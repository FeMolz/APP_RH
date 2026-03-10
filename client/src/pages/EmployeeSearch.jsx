import React, { useState, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import { FaSearch, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './EmployeeSearch.css';

const EmployeeSearch = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Quesitos Modal State


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

    const formatBirthday = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        // Exibir apenas dia e mês para aniversário, considerando o fuso horário utc
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const calculateCompanyAnniversary = (dateString) => {
        if (!dateString) return '-';
        const admissao = new Date(dateString);
        // Ajustando para o timezone local considerando que vem Z do banco
        const utcDate = new Date(admissao.getTime() + admissao.getTimezoneOffset() * 60000);

        const hoje = new Date();
        const dataFormatada = utcDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        const isAnniversaryMonth = hoje.getMonth() === utcDate.getMonth();
        const isAnniversaryDay = hoje.getDate() === utcDate.getDate();

        let anos = hoje.getFullYear() - utcDate.getFullYear();
        if (anos > 0 && isAnniversaryMonth && isAnniversaryDay) {
            return (
                <span style={{ color: '#B8860B' }}>
                    🎉 Completando {anos} {anos === 1 ? 'ano' : 'anos'}
                </span>
            );
        }

        return dataFormatada;
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
                                <th>Data de Aniversário</th>
                                <th>Aniversário de Empresa</th>
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
                                        <td>
                                            <div className="cargo-cell-content">
                                                {func.cargo?.nome_cargo || '-'}

                                            </div>
                                        </td>
                                        <td><span className="empresa-badge">{func.empresa}</span></td>
                                        <td>{formatBirthday(func.data_nascimento)}</td>
                                        <td>
                                            {calculateCompanyAnniversary(func.data_admissao)}
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
