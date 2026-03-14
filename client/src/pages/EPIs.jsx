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
        validade_dias: 365,
        descricao: '',
        isento: false
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
        const matchNome = filters.nome_epi === '' || (epi.nome_epi && epi.nome_epi.toLowerCase().includes(filters.nome_epi.toLowerCase()));
        const matchCA = filters.ca_numero === '' || (epi.ca_numero && String(epi.ca_numero).includes(filters.ca_numero));
        return matchNome && matchCA;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'checkbox' ? e.target.checked : value
        }));
    };

    const handleEdit = (epi) => {
        setEditingId(epi.id);
        setFormData({
            nome_epi: epi.nome_epi,
            ca_numero: epi.ca_numero || '',
            validade_ca: epi.validade_ca ? new Date(epi.validade_ca).toISOString().split('T')[0] : '',
            validade_dias: epi.validade_dias || 365,
            descricao: epi.descricao || '',
            isento: epi.isento || false
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            nome_epi: '',
            ca_numero: '',
            validade_ca: '',
            validade_dias: 365,
            descricao: '',
            isento: false
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
                    validade_dias: 365,
                    descricao: '',
                    isento: false
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

    const formatDate = (dateString, isento) => {
        if (isento) return 'Isento';
        if (!dateString) return '-';
        
        // As datas vêm do banco no formato ISO (ex: 2024-12-31T00:00:00.000Z).
        // Para comparar dias indepedente de fuso horário, usamos a comparação de YYYY-MM-DD local vs UTC.
        
        const dateStrOnly = dateString.split('T')[0]; // "2024-12-31"
        const localDate = new Date(dateStrOnly + 'T00:00:00'); // Força a data local exatamente as 00:00 do dia escolhido
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (localDate < today) {
            return <span style={{ color: 'red', fontWeight: 'bold' }}>VENCIDO</span>;
        }

        return localDate.toLocaleDateString();
    };

    return (
        <div className="epis-dashboard">
            <div className="dashboard-header">
                <div className="filters-container">
                    <div className="filter-group">
                        <input
                            type="text"
                            name="nome_epi"
                            value={filters.nome_epi}
                            onChange={handleFilterChange}
                            className="filter-select primary no-arrow"
                            placeholder="Buscar EPI..."
                        />
                    </div>

                    <div className="filter-group">
                        <input
                            type="text"
                            name="ca_numero"
                            value={filters.ca_numero}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    handleFilterChange(e);
                                }
                            }}
                            className="filter-select no-arrow"
                            placeholder="Todos os C.A."
                        />
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
                                <th>Validade EPI (Dias)</th>
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
                                        <td>{epi.isento ? 'Isento' : epi.ca_numero}</td>
                                        <td>{formatDate(epi.validade_ca, epi.isento)}</td>
                                        <td>{epi.validade_dias} dias</td>
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
                                    <td colSpan={isAdmin ? 6 : 5} className="no-results">Nenhum EPI encontrado.</td>
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

                            <div className="form-row" style={{ alignItems: 'center', marginBottom: '15px' }}>
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        name="isento"
                                        id="isento"
                                        checked={formData.isento}
                                        onChange={handleInputChange}
                                        style={{ width: 'auto', margin: 0 }}
                                    />
                                    <label htmlFor="isento" style={{ margin: 0 }}>Isento de C.A.</label>
                                </div>
                            </div>

                            {!formData.isento && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Número do C.A. *</label>
                                        <input
                                            type="text"
                                            name="ca_numero"
                                            value={formData.ca_numero}
                                            onChange={handleInputChange}
                                            required={!formData.isento}
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
                                            required={!formData.isento}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Validade do EPI (Dias) *</label>
                                    <input
                                        type="number"
                                        name="validade_dias"
                                        value={formData.validade_dias}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                handleInputChange(e);
                                            }
                                        }}
                                        required
                                        min="1"
                                        placeholder="Ex: 365"
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
