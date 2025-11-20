import React, { useState, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import cargosService from '../services/cargosService';
import './Historico.css';
import { FaUserSlash, FaBriefcase, FaHistory } from 'react-icons/fa';

const Historico = () => {
    const [activeTab, setActiveTab] = useState('funcionarios');
    const [funcionariosInativos, setFuncionariosInativos] = useState([]);
    const [cargosInativos, setCargosInativos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'funcionarios') {
                const data = await funcionariosService.getInativos();
                setFuncionariosInativos(data);
            } else {
                const data = await cargosService.getInativos();
                setCargosInativos(data);
            }
        } catch (err) {
            console.error("Error fetching history data:", err);
            setError("Falha ao carregar histórico.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="historico-dashboard">
            <div className="historico-header">
                <h1><FaHistory /> Histórico</h1>
                <p>Registro de colaboradores desligados e cargos inativos.</p>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'funcionarios' ? 'active' : ''}`}
                    onClick={() => setActiveTab('funcionarios')}
                >
                    <FaUserSlash /> Funcionários Desligados
                </button>
                <button
                    className={`tab-button ${activeTab === 'cargos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cargos')}
                >
                    <FaBriefcase /> Cargos Inativos
                </button>
            </div>

            {loading ? (
                <div className="loading">Carregando...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="historico-content">
                    {activeTab === 'funcionarios' && (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Nome Completo</th>
                                        <th>Cargo (na época)</th>
                                        <th>Empresa</th>
                                        <th>Data Admissão</th>
                                        <th>Data Desligamento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionariosInativos.length > 0 ? (
                                        funcionariosInativos.map(func => (
                                            <tr key={func.id}>
                                                <td>{func.nome_completo}</td>
                                                <td>{func.cargo?.nome_cargo || '-'}</td>
                                                <td><span className="empresa-badge">{func.empresa}</span></td>
                                                <td>{formatDate(func.data_admissao)}</td>
                                                <td>{formatDate(func.data_desligamento)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-results">Nenhum funcionário desligado encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'cargos' && (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Nome do Cargo</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargosInativos.length > 0 ? (
                                        cargosInativos.map(cargo => (
                                            <tr key={cargo.id}>
                                                <td>{cargo.nome_cargo}</td>
                                                <td>{cargo.descricao || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="no-results">Nenhum cargo inativo encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Historico;
