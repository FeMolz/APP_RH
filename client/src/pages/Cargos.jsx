import React, { useState, useEffect } from 'react';
import cargosService from '../services/cargosService';
import './Cargos.css';
import quesitosService from '../services/quesitosService';
import { FaSearch, FaPlus, FaBriefcase, FaTimes, FaEdit, FaTrash, FaListUl, FaMinus } from 'react-icons/fa';

const Cargos = () => {
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Quesitos Modal State
    const [showQuesitosModal, setShowQuesitosModal] = useState(false);
    const [selectedCargo, setSelectedCargo] = useState(null);
    const [cargoQuesitos, setCargoQuesitos] = useState([]);
    const [allQuesitos, setAllQuesitos] = useState([]);
    const [selectedQuesitoId, setSelectedQuesitoId] = useState('');
    const [quesitoLoading, setQuesitoLoading] = useState(false);

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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCargos = cargos.filter(cargo =>
        cargo.nome_cargo.toLowerCase().includes(searchTerm.toLowerCase())
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
                setFormSuccess('Cargo atualizado com sucesso!');
            } else {
                await cargosService.createCargo(formData);
                setFormSuccess('Cargo cadastrado com sucesso!');
            }

            if (!editingId) {
                setFormData({
                    nome_cargo: '',
                    descricao: ''
                });
            }

            fetchCargos(); // Refresh list
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

    const handleManageQuesitos = async (cargo) => {
        setSelectedCargo(cargo);
        setShowQuesitosModal(true);
        setQuesitoLoading(true);
        try {
            const [cargoDetails, allQuesitosData] = await Promise.all([
                cargosService.getCargoById(cargo.id),
                quesitosService.getQuesitos()
            ]);
            setCargoQuesitos(cargoDetails.quesitos || []);
            setAllQuesitos(allQuesitosData);
        } catch (err) {
            alert('Erro ao carregar quesitos: ' + err.message);
        } finally {
            setQuesitoLoading(false);
        }
    };

    const handleAddQuesito = async () => {
        if (!selectedQuesitoId) return;
        try {
            await cargosService.addQuesito(selectedCargo.id, selectedQuesitoId);
            // Refresh cargo quesitos
            const updatedCargo = await cargosService.getCargoById(selectedCargo.id);
            setCargoQuesitos(updatedCargo.quesitos || []);
            setSelectedQuesitoId('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveQuesito = async (quesitoId) => {
        try {
            await cargosService.removeQuesito(selectedCargo.id, quesitoId);
            // Refresh cargo quesitos
            const updatedCargo = await cargosService.getCargoById(selectedCargo.id);
            setCargoQuesitos(updatedCargo.quesitos || []);
        } catch (err) {
            alert(err.message);
        }
    };

    // Filter out quesitos already added
    const availableQuesitos = allQuesitos.filter(q =>
        !cargoQuesitos.some(cq => cq.quesito_id === q.id)
    );

    return (
        <div className="cargos-dashboard">
            <div className="dashboard-header">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar cargo..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button className="btn-add" onClick={openNewModal}>
                    <FaPlus /> Novo Cargo
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
                                <th>Nome do Cargo</th>
                                <th>Descrição</th>
                                <th>Ações</th>
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
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit-icon" onClick={() => handleManageQuesitos(cargo)} title="Gerenciar Quesitos" style={{ color: '#6f42c1' }}>
                                                    <FaListUl />
                                                </button>
                                                <button className="btn-edit-icon" onClick={() => handleEdit(cargo)} title="Editar">
                                                    <FaEdit />
                                                </button>
                                                <button className="btn-delete-icon" onClick={() => handleDelete(cargo.id)} title="Excluir">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="no-results">Nenhum cargo encontrado.</td>
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

            {showQuesitosModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <button className="modal-close" onClick={() => setShowQuesitosModal(false)}>
                            <FaTimes />
                        </button>
                        <h2>Quesitos - {selectedCargo?.nome_cargo}</h2>

                        <div className="quesitos-manager">
                            <div className="add-quesito-section">
                                <select
                                    value={selectedQuesitoId}
                                    onChange={(e) => setSelectedQuesitoId(e.target.value)}
                                    className="quesito-select"
                                >
                                    <option value="">Selecione um quesito para adicionar...</option>
                                    {availableQuesitos.map(q => (
                                        <option key={q.id} value={q.id}>{q.descricao_quesito}</option>
                                    ))}
                                </select>
                                <button
                                    className="btn-add-quesito"
                                    onClick={handleAddQuesito}
                                    disabled={!selectedQuesitoId}
                                >
                                    <FaPlus /> Adicionar
                                </button>
                            </div>

                            {quesitoLoading ? (
                                <div className="loading-small">Carregando...</div>
                            ) : (
                                <div className="quesitos-list">
                                    {cargoQuesitos.length > 0 ? (
                                        <ul>
                                            {cargoQuesitos.map(cq => (
                                                <li key={cq.quesito.id} className="quesito-item">
                                                    <span>{cq.quesito.descricao_quesito}</span>
                                                    <button
                                                        className="btn-remove-quesito"
                                                        onClick={() => handleRemoveQuesito(cq.quesito.id)}
                                                        title="Remover"
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-quesitos">Nenhum quesito vinculado.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cargos;
