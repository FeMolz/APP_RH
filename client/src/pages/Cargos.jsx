import React, { useState, useEffect } from 'react';
import cargosService from '../services/cargosService';
import authService from '../services/authService';
import './Cargos.css';

import { FaSearch, FaPlus, FaBriefcase, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const Cargos = () => {
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ nome_cargo: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);



    // Form State
    const [formData, setFormData] = useState({
        nome_cargo: '',
        descricao: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchCargos();
    }, []);

    const fetchCargos = async () => {
        setLoading(true);
        try {
            const data = await cargosService.getCargos();
            setCargos(data);
        } catch (err) {
            console.error("Error fetching cargos:", err);
            setError("Falha ao carregar cargos.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const uniqueCargos = [...new Set(cargos.map(c => c.nome_cargo).filter(Boolean))].sort();

    const filteredCargos = cargos.filter(cargo =>
        filters.nome_cargo === '' || cargo.nome_cargo === filters.nome_cargo
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (cargo) => {
        setEditingId(cargo.id);
        setFormData({
            nome_cargo: cargo.nome_cargo,
            descricao: cargo.descricao || ''
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            nome_cargo: '',
            descricao: ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este cargo?')) {
            try {
                await cargosService.deleteCargo(id);
                fetchCargos();
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
                await cargosService.updateCargo(editingId, formData);
            } else {
                await cargosService.createCargo(formData);
            }

            if (!editingId) {
                setFormData({
                    nome_cargo: '',
                    descricao: ''
                });
            }

            fetchCargos(); // Refresh list
            setShowModal(false);
            setEditingId(null);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };



    return (
        <div className="cargos-dashboard">
            <div className="dashboard-header">
                <div className="filters-container">
                    <div className="filter-group">
                        <select
                            name="nome_cargo"
                            value={filters.nome_cargo}
                            onChange={handleFilterChange}
                            className="filter-select primary"
                        >
                            <option value="">Todos os Cargos</option>
                            {uniqueCargos.map((cargo, index) => (
                                <option key={index} value={cargo}>{cargo}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {isAdmin && (
                    <button className="btn-add" onClick={openNewModal}>
                        <FaPlus /> Novo Cargo
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
                                <th>Nome do Cargo</th>
                                <th>Descrição</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCargos.length > 0 ? (
                                filteredCargos.map(cargo => (
                                    <tr key={cargo.id}>
                                        <td>
                                            <div className="cargo-cell">
                                                {cargo.nome_cargo}
                                            </div>
                                        </td>
                                        <td>{cargo.descricao || 'Sem descrição'}</td>
                                        {isAdmin && (
                                            <td>
                                                <div className="action-buttons">

                                                    <button className="btn-edit-icon" onClick={() => handleEdit(cargo)} title="Editar">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-delete-icon" onClick={() => handleDelete(cargo.id)} title="Excluir">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 3 : 2} className="no-results">Nenhum cargo encontrado.</td>
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
                        <h2>{editingId ? 'Editar Cargo' : 'Novo Cargo'}</h2>

                        {formSuccess && <div className="alert success">{formSuccess}</div>}
                        {formError && <div className="alert error">{formError}</div>}

                        <form onSubmit={handleSubmit} className="cargo-form">
                            <div className="form-group">
                                <label>Nome do Cargo *</label>
                                <input
                                    type="text"
                                    name="nome_cargo"
                                    value={formData.nome_cargo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ex: Analista de RH"
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    placeholder="Breve descrição das responsabilidades..."
                                    rows="4"
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

export default Cargos;
