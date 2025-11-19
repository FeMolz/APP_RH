import React, { useState, useEffect } from 'react';
import formacoesService from '../services/formacoesService';
import funcionariosService from '../services/funcionariosService';
import './Formacoes.css';
import { FaPlus, FaGraduationCap, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';

const Formacoes = () => {
    const [formacoes, setFormacoes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nome_formacao: '',
        instituicao: '',
        nivel: '',
        data_inicio: '',
        data_conclusao: '',
        descricao: '',
        funcionario_id: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [formacoesData, funcionariosData] = await Promise.all([
                formacoesService.getFormacoes(),
                funcionariosService.getFuncionarios() // We need all employees to select from
            ]);
            setFormacoes(formacoesData);
            setFuncionarios(funcionariosData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Falha ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (formacao) => {
        setEditingId(formacao.id);
        setFormData({
            nome_formacao: formacao.nome_formacao,
            instituicao: formacao.instituicao,
            nivel: formacao.nivel,
            data_inicio: formacao.data_inicio.split('T')[0],
            data_conclusao: formacao.data_conclusao.split('T')[0],
            descricao: formacao.descricao || '',
            funcionario_id: formacao.funcionario_id
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({
            nome_formacao: '',
            instituicao: '',
            nivel: '',
            data_inicio: '',
            data_conclusao: '',
            descricao: '',
            funcionario_id: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');

        try {
            if (editingId) {
                await formacoesService.updateFormacao(editingId, formData);
                setFormSuccess('Formação atualizada com sucesso!');
            } else {
                await formacoesService.createFormacao(formData);
                setFormSuccess('Formação cadastrada com sucesso!');
            }

            if (!editingId) {
                setFormData({
                    nome_formacao: '',
                    instituicao: '',
                    nivel: '',
                    data_inicio: '',
                    data_conclusao: '',
                    descricao: '',
                    funcionario_id: ''
                });
            }

            fetchData(); // Refresh list
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

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta formação?')) {
            try {
                await formacoesService.deleteFormacao(id);
                fetchData();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="formacoes-dashboard">
            <div className="dashboard-header">
                <h1>Formações</h1>
                <button className="btn-add" onClick={openNewModal}>
                    <FaPlus /> Nova Formação
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
                                <th>Colaborador</th>
                                <th>Formação</th>
                                <th>Instituição</th>
                                <th>Nível</th>
                                <th>Período</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formacoes.length > 0 ? (
                                formacoes.map(formacao => (
                                    <tr key={formacao.id}>
                                        <td>{formacao.funcionario?.nome_completo}</td>
                                        <td>
                                            <div className="formacao-cell">
                                                {formacao.nome_formacao}
                                            </div>
                                        </td>
                                        <td>{formacao.instituicao}</td>
                                        <td><span className="nivel-badge">{formacao.nivel}</span></td>
                                        <td>
                                            {new Date(formacao.data_inicio).toLocaleDateString()} - {new Date(formacao.data_conclusao).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit-icon" onClick={() => handleEdit(formacao)} title="Editar">
                                                    <FaEdit />
                                                </button>
                                                <button className="btn-delete-icon" onClick={() => handleDelete(formacao.id)} title="Excluir">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-results">Nenhuma formação encontrada.</td>
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
                        <h2>{editingId ? 'Editar Formação' : 'Nova Formação'}</h2>

                        {formSuccess && <div className="alert success">{formSuccess}</div>}
                        {formError && <div className="alert error">{formError}</div>}

                        <form onSubmit={handleSubmit} className="formacao-form">
                            <div className="form-group">
                                <label>Colaborador *</label>
                                <select
                                    name="funcionario_id"
                                    value={formData.funcionario_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione um colaborador</option>
                                    {funcionarios.map(func => (
                                        <option key={func.id} value={func.id}>
                                            {func.nome_completo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome da Formação *</label>
                                    <input
                                        type="text"
                                        name="nome_formacao"
                                        value={formData.nome_formacao}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Instituição *</label>
                                    <input
                                        type="text"
                                        name="instituicao"
                                        value={formData.instituicao}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nível *</label>
                                    <select
                                        name="nivel"
                                        value={formData.nivel}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione o nível</option>
                                        <option value="Técnico">Técnico</option>
                                        <option value="Graduação">Graduação</option>
                                        <option value="Pós-Graduação">Pós-Graduação</option>
                                        <option value="Mestrado">Mestrado</option>
                                        <option value="Doutorado">Doutorado</option>
                                        <option value="Certificação">Certificação</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data Início *</label>
                                    <input
                                        type="date"
                                        name="data_inicio"
                                        value={formData.data_inicio}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data Conclusão *</label>
                                    <input
                                        type="date"
                                        name="data_conclusao"
                                        value={formData.data_conclusao}
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
                                    rows="3"
                                ></textarea>
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

export default Formacoes;
