import React, { useState, useEffect } from 'react';
import funcionariosService from '../services/funcionariosService';
import authService from '../services/authService';
import './Funcionarios.css';
import { FaSearch, FaPlus, FaUserTie, FaTimes, FaFilter, FaBriefcase, FaEdit, FaTrash } from 'react-icons/fa';

const Funcionarios = () => {
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    const [funcionarios, setFuncionarios] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        nome: '',
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
        empresa: '',
        telefone: '',
        localizacao: '',
        setor: '',
        step: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    // Details Modal State
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedFuncionario, setSelectedFuncionario] = useState(null);

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const uniqueNomes = [...new Set(funcionarios.map(f => f.nome_completo).filter(Boolean))].sort();

    const filteredFuncionarios = funcionarios.filter(func => {
        const matchNome = filters.nome === '' || func.nome_completo === filters.nome;
        const matchEmpresa = filters.empresa === '' || func.empresa === filters.empresa;
        const matchCargo = filters.cargo_id === '' || func.cargo_id === filters.cargo_id;
        return matchNome && matchEmpresa && matchCargo;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (funcionario) => {
        setEditingId(funcionario.id);
        setFormData({
            nome_completo: funcionario.nome_completo,
            cpf: funcionario.cpf,
            data_nascimento: funcionario.data_nascimento ? funcionario.data_nascimento.split('T')[0] : '',
            data_admissao: funcionario.data_admissao.split('T')[0],
            cargo_id: funcionario.cargo_id,
            data_contabilidade: funcionario.data_contabilidade ? funcionario.data_contabilidade.split('T')[0] : '',
            data_desligamento: funcionario.data_desligamento ? funcionario.data_desligamento.split('T')[0] : '',
            empresa: funcionario.empresa,
            telefone: funcionario.telefone || '',
            localizacao: funcionario.localizacao || '',
            setor: funcionario.setor || '',
            step: funcionario.step || ''
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            nome_completo: '',
            cpf: '',
            data_nascimento: '',
            data_admissao: '',
            cargo_id: '',
            data_contabilidade: '',
            data_desligamento: '',
            empresa: '',
            telefone: '',
            localizacao: '',
            setor: '',
            step: ''
        });
        setShowModal(true);
    };

    const handleViewDetails = (funcionario) => {
        setSelectedFuncionario(funcionario);
        setShowDetailsModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            try {
                await funcionariosService.deleteFuncionario(id);
                fetchData();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            if (editingId) {
                await funcionariosService.updateFuncionario(editingId, formData);
            } else {
                await funcionariosService.createFuncionario(formData);
            }

            if (!editingId) {
                setFormData({
                    nome_completo: '',
                    cpf: '',
                    data_nascimento: '',
                    data_admissao: '',
                    cargo_id: '',
                    data_contabilidade: '',
                    data_desligamento: '',
                    empresa: '',
                    telefone: '',
                    localizacao: '',
                    setor: '',
                    step: ''
                });
            }

            fetchData(); // Refresh list
            setShowModal(false);
            setEditingId(null);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const formatLocalDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Adjust for timezone offset to display local date correctly
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return localDate.toLocaleDateString();
    };

    return (
        <div className="funcionarios-dashboard">
            <div className="dashboard-header">
                <div className="filters-container">
                    <div className="filter-group">
                        <select
                            name="nome"
                            value={filters.nome}
                            onChange={handleFilterChange}
                            className="filter-select primary"
                        >
                            <option value="">Todos os Funcionários</option>
                            {uniqueNomes.map((nome, index) => (
                                <option key={index} value={nome}>{nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
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

                {isAdmin && (
                    <button className="btn-add" onClick={openNewModal}>
                        <FaPlus /> Novo Funcionário
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
                                <th>Nome Completo</th>
                                <th>Cargo</th>
                                <th>Empresa</th>
                                <th>Admissão</th>
                                {isAdmin && <th>Ações</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFuncionarios.length > 0 ? (
                                filteredFuncionarios.map(func => (
                                    <tr key={func.id} onClick={() => handleViewDetails(func)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="user-cell">
                                                {func.nome_completo}
                                            </div>
                                        </td>
                                        <td>{func.cargo?.nome_cargo || 'Cargo não definido'}</td>
                                        <td><span className="empresa-badge">{func.empresa}</span></td>
                                        <td>{formatLocalDate(func.data_admissao)}</td>
                                        {isAdmin && (
                                            <td>
                                                <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                                                    <button className="btn-edit-icon" onClick={() => handleEdit(func)} title="Editar">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-delete-icon" onClick={() => handleDelete(func.id)} title="Excluir">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4} className="no-results">Nenhum funcionário encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content new-employee-modal">
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            <FaTimes />
                        </button>
                        <h2 className="modal-title">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>

                        {formSuccess && <div className="alert success">{formSuccess}</div>}
                        {formError && <div className="alert error">{formError}</div>}

                        <form onSubmit={handleSubmit} className="new-funcionario-form">
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Nome Completo *</label>
                                    <input
                                        type="text"
                                        name="nome_completo"
                                        value={formData.nome_completo}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>CPF *</label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="000.000.000-00"
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data de Nascimento</label>
                                    <input
                                        type="date"
                                        name="data_nascimento"
                                        value={formData.data_nascimento}
                                        onChange={handleInputChange}
                                        className="form-control"
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
                                        className="form-control"
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
                                        className="form-control"
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
                                    <label>Data de Admissão *</label>
                                    <input
                                        type="date"
                                        name="data_admissao"
                                        value={formData.data_admissao}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data Contabilidade</label>
                                    <input
                                        type="date"
                                        name="data_contabilidade"
                                        value={formData.data_contabilidade}
                                        onChange={handleInputChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        name="telefone"
                                        value={formData.telefone}
                                        onChange={handleInputChange}
                                        placeholder="(00) 00000-0000"
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Localização</label>
                                    <input
                                        type="text"
                                        name="localizacao"
                                        value={formData.localizacao}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Obra A, Escritório Central"
                                        className="form-control"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Setor *</label>
                                    <select
                                        name="setor"
                                        value={formData.setor}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control"
                                    >
                                        <option value="">Selecione um setor</option>
                                        <option value="Administrativo">Administrativo</option>
                                        <option value="Engenharia">Engenharia</option>
                                        <option value="Obras">Obras</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Vivant">Vivant</option>
                                        <option value="Compras">Compras</option>
                                        <option value="Tecnologia">Tecnologia</option>
                                        <option value="Limpeza">Limpeza</option>
                                        <option value="Rio Sports de Areia">Rio Sports de Areia</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Step *</label>
                                    <select
                                        name="step"
                                        value={formData.step}
                                        onChange={handleInputChange}
                                        required
                                        className="form-control"
                                    >
                                        <option value="">Selecione um step</option>
                                        <option value="Trainee">Trainee</option>
                                        <option value="Junior I">Junior I</option>
                                        <option value="Junior II">Junior II</option>
                                        <option value="Junior III">Junior III</option>
                                        <option value="Pleno I">Pleno I</option>
                                        <option value="Pleno II">Pleno II</option>
                                        <option value="Pleno III">Pleno III</option>
                                        <option value="Senior">Senior</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-submit" disabled={formLoading}>
                                    {formLoading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedFuncionario && (
                <div className="modal-overlay">
                    <div className="modal-content details-modal">
                        <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                            <FaTimes />
                        </button>
                        <h2>Detalhes do Funcionário</h2>

                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Nome Completo:</strong>
                                <span>{selectedFuncionario.nome_completo}</span>
                            </div>
                            <div className="detail-item">
                                <strong>CPF:</strong>
                                <span>{selectedFuncionario.cpf}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Cargo:</strong>
                                <span>{selectedFuncionario.cargo?.nome_cargo || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Empresa:</strong>
                                <span>{selectedFuncionario.empresa}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Telefone:</strong>
                                <span>{selectedFuncionario.telefone || 'Não informado'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Localização:</strong>
                                <span>{selectedFuncionario.localizacao || 'Não informada'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Setor:</strong>
                                <span>{selectedFuncionario.setor || 'Não informado'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Step:</strong>
                                <span>{selectedFuncionario.step || 'Não informado'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Data de Nascimento:</strong>
                                <span>{selectedFuncionario.data_nascimento ? new Date(new Date(selectedFuncionario.data_nascimento).getTime() + new Date(selectedFuncionario.data_nascimento).getTimezoneOffset() * 60000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Data de Admissão:</strong>
                                <span>{selectedFuncionario.data_admissao ? new Date(new Date(selectedFuncionario.data_admissao).getTime() + new Date(selectedFuncionario.data_admissao).getTimezoneOffset() * 60000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Data Contabilidade:</strong>
                                <span>{selectedFuncionario.data_contabilidade ? new Date(new Date(selectedFuncionario.data_contabilidade).getTime() + new Date(selectedFuncionario.data_contabilidade).getTimezoneOffset() * 60000).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Funcionarios;
