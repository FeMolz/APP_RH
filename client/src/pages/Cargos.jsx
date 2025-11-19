import React, { useState, useEffect } from 'react';
import cargosService from '../services/cargosService';
import './Cargos.css';
import { FaSearch, FaPlus, FaBriefcase, FaTimes } from 'react-icons/fa';

const Cargos = () => {
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            await cargosService.createCargo(formData);
            setFormSuccess('Cargo cadastrado com sucesso!');
            setFormData({
                nome_cargo: '',
                descricao: ''
            });
            fetchCargos(); // Refresh list
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
                <button className="btn-add" onClick={() => setShowModal(true)}>
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
                        <h2>Novo Cargo</h2>

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
                                {formLoading ? 'Salvando...' : 'Cadastrar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cargos;
