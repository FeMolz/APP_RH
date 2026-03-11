import React, { useState, useEffect } from 'react';
import quesitosService from '../services/quesitosService';
import authService from '../services/authService';
import './Quesitos.css';
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaListUl } from 'react-icons/fa';

const Quesitos = () => {
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    const [quesitos, setQuesitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ descricao_quesito: '', bloco: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewModal, setViewModal] = useState({ show: false, text: '' });

    const handleViewDescription = (text) => setViewModal({ show: true, text });

    const [formData, setFormData] = useState({
        descricao_quesito: '',
        bloco: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchQuesitos();
    }, []);

    const fetchQuesitos = async () => {
        setLoading(true);
        try {
            const data = await quesitosService.getQuesitos();
            setQuesitos(data);
        } catch (err) {
            console.error("Error fetching quesitos:", err);
            setError("Falha ao carregar quesitos.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const uniqueDescricoes = [...new Set(quesitos.map(q => q.descricao_quesito).filter(Boolean))].sort();

    const filteredQuesitos = quesitos.filter(quesito => {
        const matchDescricao = filters.descricao_quesito === '' || (quesito.descricao_quesito && quesito.descricao_quesito.toLowerCase().includes(filters.descricao_quesito.toLowerCase()));
        const matchBloco = filters.bloco === '' || quesito.bloco === filters.bloco;
        return matchDescricao && matchBloco;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (quesito) => {
        setEditingId(quesito.id);
        setFormData({
            descricao_quesito: quesito.descricao_quesito,
            bloco: quesito.bloco || ''
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            descricao_quesito: '',
            bloco: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este quesito?')) {
            try {
                await quesitosService.deleteQuesito(id);
                fetchQuesitos();
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
                await quesitosService.updateQuesito(editingId, formData);
            } else {
                await quesitosService.createQuesito(formData);
            }

            if (!editingId) {
                setFormData({
                    descricao_quesito: '',
                    bloco: ''
                });
            }

            fetchQuesitos(); // Refresh list
            setShowModal(false);
            setEditingId(null);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="quesitos-dashboard">
            <div className="dashboard-header">
                <div className="filters-container">
                    <div className="filter-group">
                        <input
                            type="text"
                            name="descricao_quesito"
                            value={filters.descricao_quesito}
                            onChange={handleFilterChange}
                            className="filter-select primary no-arrow"
                            placeholder="Buscar Quesito..."
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            name="bloco"
                            className="filter-select"
                            value={filters.bloco}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos os Blocos</option>
                            <option value="Responsabilidade e Entrega">Responsabilidade e Entrega</option>
                            <option value="Competências Comportamentais">Competências Comportamentais</option>
                            <option value="Competências Técnicas">Competências Técnicas</option>
                        </select>
                    </div>
                </div>
                {isAdmin && (
                    <button className="btn-add" onClick={openNewModal}>
                        <FaPlus /> Novo Quesito
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
                                <th>Descrição do Quesito</th>
                                <th>Bloco</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuesitos.length > 0 ? (
                                filteredQuesitos.map(quesito => (
                                    <tr key={quesito.id}>
                                        <td>
                                            <div className="quesito-cell">
                                                <span 
                                                    className="quesito-text" 
                                                    title="Clique para ver a descrição completa"
                                                    onClick={() => handleViewDescription(quesito.descricao_quesito)}
                                                >
                                                    {quesito.descricao_quesito}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="bloco-badge" style={{
                                                backgroundColor: quesito.bloco ? '#e9ecef' : 'transparent',
                                                padding: quesito.bloco ? '4px 10px' : '0',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                color: '#495057',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {quesito.bloco || '-'}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-edit-icon" onClick={() => handleEdit(quesito)} title="Editar">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-delete-icon" onClick={() => handleDelete(quesito.id)} title="Excluir">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 3 : 2} className="no-results">Nenhum quesito encontrado.</td>
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
                        <h2>{editingId ? 'Editar Quesito' : 'Novo Quesito'}</h2>

                        {formSuccess && <div className="alert success">{formSuccess}</div>}
                        {formError && <div className="alert error">{formError}</div>}

                        <form onSubmit={handleSubmit} className="quesito-form">
                            <div className="form-group">
                                <label>Descrição do Quesito *</label>
                                <textarea
                                    name="descricao_quesito"
                                    value={formData.descricao_quesito}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ex: Conhecimento em React"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Bloco *</label>
                                <select
                                    name="bloco"
                                    value={formData.bloco}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione um bloco</option>
                                    <option value="Responsabilidade e Entrega">Responsabilidade e Entrega</option>
                                    <option value="Competências Comportamentais">Competências Comportamentais</option>
                                    <option value="Competências Técnicas">Competências Técnicas</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-submit" disabled={formLoading}>
                                {formLoading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {viewModal.show && (
                <div className="modal-overlay" onClick={() => setViewModal({ show: false, text: '' })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '25px' }}>
                        <button className="modal-close" onClick={() => setViewModal({ show: false, text: '' })}>
                            <FaTimes />
                        </button>
                        <h3 style={{ marginTop: 0, color: '#2f4050', marginBottom: '15px' }}>Descrição Completa</h3>
                        <p style={{ lineHeight: '1.5', color: '#495057', fontSize: '1rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap', margin: 0 }}>
                            {viewModal.text}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quesitos;
