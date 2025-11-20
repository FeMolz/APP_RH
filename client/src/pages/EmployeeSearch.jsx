import React, { useState, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import cargosService from '../services/cargosService';
import './EmployeeSearch.css';
import { FaSearch, FaInfoCircle, FaTimes, FaListUl } from 'react-icons/fa';

const EmployeeSearch = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Quesitos Modal State
    const [showQuesitosModal, setShowQuesitosModal] = useState(false);
    const [selectedCargoName, setSelectedCargoName] = useState('');
    const [cargoQuesitos, setCargoQuesitos] = useState([]);
    const [quesitoLoading, setQuesitoLoading] = useState(false);

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

    const handleViewQuesitos = async (cargoId, cargoName) => {
        setSelectedCargoName(cargoName);
        setShowQuesitosModal(true);
        setQuesitoLoading(true);
        try {
            const cargoDetails = await cargosService.getCargoById(cargoId);
            setCargoQuesitos(cargoDetails.quesitos || []);
        } catch (err) {
            alert('Erro ao carregar quesitos: ' + err.message);
        } finally {
            setQuesitoLoading(false);
        }
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
                                        <td>
                                            <div className="cargo-cell-content">
                                                {func.cargo?.nome_cargo || '-'}
                                                {func.cargo && func.cargo._count?.quesitos > 0 && (
                                                    <button
                                                        className="btn-info-icon"
                                                        onClick={() => handleViewQuesitos(func.cargo.id, func.cargo.nome_cargo)}
                                                        title="Ver Quesitos"
                                                    >
                                                        <FaListUl />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
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

            {showQuesitosModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <button className="modal-close" onClick={() => setShowQuesitosModal(false)}>
                            <FaTimes />
                        </button>
                        <h2>Quesitos - {selectedCargoName}</h2>

                        {quesitoLoading ? (
                            <div className="loading-small">Carregando...</div>
                        ) : (
                            <div className="quesitos-view-list">
                                {cargoQuesitos.length > 0 ? (
                                    <ul>
                                        {cargoQuesitos.map(cq => (
                                            <li key={cq.quesito.id} className="quesito-view-item">
                                                <span className="bullet">•</span>
                                                {cq.quesito.descricao_quesito}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-quesitos">Nenhum quesito vinculado a este cargo.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeSearch;
