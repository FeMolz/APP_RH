import React, { useState, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import './Funcionarios.css';
import { FaSearch, FaPlus, FaUserTie, FaTimes, FaFilter, FaBriefcase } from 'react-icons/fa';

const Funcionarios = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        empresa: '',
        cargo_id: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        data_admissao: '',
        cargo_id: '',
        data_contabilidade: '',
        data_desligamento: '',
        empresa: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [funcsData, cargosData] = await Promise.all([
                funcionariosService.getFuncionarios(filters),
                funcionariosService.getCargos()
            ]);
            setFuncionarios(funcsData);
            setCargos(cargosData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Falha ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredFuncionarios = funcionarios.filter(func =>
        func.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            await funcionariosService.createFuncionario(formData);
            setFormSuccess('Funcionário cadastrado com sucesso!');
            setFormData({
                nome_completo: '',
                cpf: '',
                data_nascimento: '',
                data_admissao: '',
                cargo_id: '',
                data_contabilidade: '',
                data_desligamento: '',
                empresa: ''
            });
            fetchData(); // Refresh list
            setTimeout(() => {
                setShowModal(false);
                setFormSuccess('');
            }, 1500);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="funcionarios-dashboard">
            <div className="dashboard-header">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar funcionário..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>

                <div className="filters-container">
                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select
                            name="empresa"
                            value={filters.empresa}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">Todas as Empresas</option>
                            <option value="CVF Incorporadora">CVF Incorporadora</option>
                            <option value="Ligasul">Ligasul</option>
                            <option value="Vivant">Vivant</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <FaBriefcase className="filter-icon" />
                        <select
                            name="cargo_id"
                            value={filters.cargo_id}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">Todos os Cargos</option>
                            {cargos.map(cargo => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.nome_cargo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="btn-add" onClick={() => setShowModal(true)}>
                    <FaPlus /> Novo Funcionário
                </button>
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
                                        <td>{func.cargo?.nome_cargo || 'Cargo não definido'}</td>
                                        <td><span className="empresa-badge">{func.empresa}</span></td>
                                        <td>{new Date(func.data_admissao).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-results">Nenhum funcionário encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            <FaTimes />
                        </button>
                        <h2>Novo Funcionário</h2>

                        {formSuccess && <div className="alert success">{formSuccess}</div>}
                        {formError && <div className="alert error">{formError}</div>}

                        <form onSubmit={handleSubmit} className="funcionario-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome Completo *</label>
                                    <input
                                        type="text"
                                        name="nome_completo"
                                        value={formData.nome_completo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CPF *</label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Empresa *</label>
                                    <select
                                        name="empresa"
                                        value={formData.empresa}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione a empresa</option>
                                        <option value="CVF Incorporadora">CVF Incorporadora</option>
                                        <option value="Ligasul">Ligasul</option>
                                        <option value="Vivant">Vivant</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Cargo *</label>
                                    <select
                                        name="cargo_id"
                                        value={formData.cargo_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione um cargo</option>
                                        {cargos.map(cargo => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.nome_cargo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data de Nascimento</label>
                                    <input
                                        type="date"
                                        name="data_nascimento"
                                        value={formData.data_nascimento}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data de Admissão *</label>
                                    <input
                                        type="date"
                                        name="data_admissao"
                                        value={formData.data_admissao}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data Contabilidade</label>
                                    <input
                                        type="date"
                                        name="data_contabilidade"
                                        value={formData.data_contabilidade}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={formLoading}>
                                {formLoading ? 'Salvando...' : 'Cadastrar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Funcionarios;
