import React, { useState, useEffect } from 'react';
import episService from '../services/episService';
import './EPIs.css';
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaTools } from 'react-icons/fa';

const EPIs = () => {
    const [epis, setEpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredEpis = epis.filter(epi =>
        epi.nome_epi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        epi.ca_numero.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                setFormSuccess('EPI atualizado com sucesso!');
            } else {
                await episService.createEpi(formData);
                setFormSuccess('EPI cadastrado com sucesso!');
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
            setTimeout(() => {
                setShowModal(false);
                setFormSuccess('');
                setEditingId(null);
            }, 1500);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="epis-dashboard">
            <div className="dashboard-header">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar EPI por nome ou CA..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button className="btn-add" onClick={openNewModal}>
                    <FaPlus /> Novo EPI
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
                                <th>Nome do EPI</th>
                                <th>C.A.</th>
                                <th>Validade C.A.</th>
                                <th>Descrição</th>
                                <th>Ações</th>
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-results">Nenhum EPI encontrado.</td>
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
