import React, { useState, useEffect } from 'react';
import quesitosService from '../services/quesitosService';
import './Quesitos.css';
import { FaSearch, FaPlus, FaTimes, FaEdit, FaTrash, FaListUl } from 'react-icons/fa';

const Quesitos = () => {
    const [quesitos, setQuesitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        descricao_quesito: ''
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredQuesitos = quesitos.filter(quesito =>
        quesito.descricao_quesito.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            descricao_quesito: quesito.descricao_quesito
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            descricao_quesito: ''
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
                setFormSuccess('Quesito atualizado com sucesso!');
            } else {
                await quesitosService.createQuesito(formData);
                setFormSuccess('Quesito cadastrado com sucesso!');
            }

            if (!editingId) {
                setFormData({
                    descricao_quesito: ''
                });
            }

            fetchQuesitos(); // Refresh list
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

    return (
        <div className="quesitos-dashboard">
            <div className="dashboard-header">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar quesito..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button className="btn-add" onClick={openNewModal}>
                    <FaPlus /> Novo Quesito
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
                                <th>Descrição do Quesito</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuesitos.length > 0 ? (
                                filteredQuesitos.map(quesito => (
                                    <tr key={quesito.id}>
                                        <td>
                                            <div className="quesito-cell">
                                                <FaListUl className="quesito-icon" />
                                                {quesito.descricao_quesito}
                                            </div>
                                        </td>
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="no-results">Nenhum quesito encontrado.</td>
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

export default Quesitos;
