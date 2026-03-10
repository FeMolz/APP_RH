import React, { useState, useEffect } from 'react';
import episService from '../services/episService';
import authService from '../services/authService';
import './EPIs.css';
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaTools } from 'react-icons/fa';

const EPIs = () => {
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    const [epis, setEpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ nome_epi: '', ca_numero: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        nome_epi: '',
        ca_numero: '',
        validade_ca: '',
        descricao: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchEpis();
    }, []);

    const fetchEpis = async () => {
        setLoading(true);
        try {
            const data = await episService.getEpis();
            setEpis(data);
        } catch (err) {
            console.error("Error fetching EPIs:", err);
            setError("Falha ao carregar EPIs.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const uniqueNomes = [...new Set(epis.map(e => e.nome_epi).filter(Boolean))].sort();
    const uniqueCAs = [...new Set(epis.map(e => e.ca_numero).filter(Boolean))].sort();

    const filteredEpis = epis.filter(epi => {
        const matchNome = filters.nome_epi === '' || epi.nome_epi === filters.nome_epi;
        const matchCA = filters.ca_numero === '' || epi.ca_numero === filters.ca_numero;
        return matchNome && matchCA;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (epi) => {
        setEditingId(epi.id);
        setFormData({
            nome_epi: epi.nome_epi,
            ca_numero: epi.ca_numero,
            validade_ca: epi.validade_ca ? new Date(epi.validade_ca).toISOString().split('T')[0] : '',
            descricao: epi.descricao || ''
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            nome_epi: '',
            ca_numero: '',
            validade_ca: '',
            descricao: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este EPI?')) {
            try {
                await episService.deleteEpi(id);
                fetchEpis();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            if (editingId) {
                await episService.updateEpi(editingId, formData);
            } else {
                await episService.createEpi(formData);
            }

            if (!editingId) {
                setFormData({
                    nome_epi: '',
                    ca_numero: '',
                    validade_ca: '',
                    descricao: ''
                });
            }

            fetchEpis(); // Refresh list
            setShowModal(false);
            setEditingId(null);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return localDate.toLocaleDateString();
    };

    return (
        <div className="epis-dashboard">
            <div className="dashboard-header">
                <div className="filters-container">
                    <div className="filter-group">
                        <select
                            name="nome_epi"
                            value={filters.nome_epi}
                            onChange={handleFilterChange}
                            className="filter-select primary"
                        >
                            <option value="">Todos os EPIs</option>
                            {uniqueNomes.map((nome, index) => (
                                <option key={index} value={nome}>{nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            name="ca_numero"
                            value={filters.ca_numero}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">Todos os C.A.</option>
                            {uniqueCAs.map((ca, index) => (
                                <option key={index} value={ca}>{ca}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {isAdmin && (
                    <button className="btn-add" onClick={openNewModal}>
                        <FaPlus /> Novo EPI
                    </button>
                )}
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
                                <th>Nome do EPI</th>
                                <th>C.A.</th>
                                <th>Validade C.A.</th>
                                <th>Descrição</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEpis.length > 0 ? (
                                filteredEpis.map(epi => (
                                    <tr key={epi.id}>
                                        <td>
                                            <div className="epi-cell">
                                                {epi.nome_epi}
                                            </div>
                                        </td>
                                        <td>{epi.ca_numero}</td>
                                        <td>{formatDate(epi.validade_ca)}</td>
                                        <td>{epi.descricao || '-'}</td>
                                        {isAdmin && (
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-edit-icon" onClick={() => handleEdit(epi)} title="Editar">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-delete-icon" onClick={() => handleDelete(epi.id)} title="Excluir">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="no-results">Nenhum EPI encontrado.</td>
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
                        <h2>{editingId ? 'Editar EPI' : 'Novo EPI'}</h2>

                        {formSuccess && <div className="alert success">{formSuccess}</div>}
                        {formError && <div className="alert error">{formError}</div>}

                        <form onSubmit={handleSubmit} className="epi-form">
                            <div className="form-group">
                                <label>Nome do EPI *</label>
                                <input
                                    type="text"
                                    name="nome_epi"
                                    value={formData.nome_epi}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ex: Capacete de Segurança"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Número do C.A. *</label>
                                    <input
                                        type="text"
                                        name="ca_numero"
                                        value={formData.ca_numero}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Ex: 12345"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Validade do C.A. *</label>
                                    <input
                                        type="date"
                                        name="validade_ca"
                                        value={formData.validade_ca}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    placeholder="Detalhes adicionais sobre o EPI..."
                                    rows="3"
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={formLoading}>
                                {formLoading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EPIs;
