import React, { useState, useEffect } from 'react';
import { entregaService } from '../services/entregaService';
import episService from '../services/episService';
import funcionariosService from '../services/funcionariosService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { relatorioService } from '../services/relatorioService';
import './EntregaEPIs.css';

const EntregaEPIs = () => {
    const [activeTab, setActiveTab] = useState('entregar'); // 'entregar' | 'devolver'
    const [funcionarios, setFuncionarios] = useState([]);
    const [epis, setEpis] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [episAtivos, setEpisAtivos] = useState([]); // For return tab

    // ... (rest of the component state)

    // ... (rest of the component logic)

    const handleGenerateReport = async () => {
        console.log('Generating report...', { selectedFuncionarioReturn, historicoLength: historico.length });

        if (!selectedFuncionarioReturn || historico.length === 0) {
            alert('Selecione um funcionário com histórico de devoluções para gerar o relatório.');
            return;
        }

        try {
            const funcionario = funcionarios.find(f => f.id === selectedFuncionarioReturn);
            if (!funcionario) {
                console.error('Funcionario not found', { selectedFuncionarioReturn, funcionariosIds: funcionarios.map(f => f.id) });
                return;
            }

            const doc = new jsPDF();
            console.log('jsPDF instance created');

            // Header
            doc.setFontSize(18);
            doc.text('Relatório de Devolução de EPIs', 14, 20);

            doc.setFontSize(12);
            doc.text(`Funcionário: ${funcionario.nome_completo}`, 14, 30);
            doc.text(`CPF: ${funcionario.cpf}`, 14, 36);
            doc.text(`Cargo: ${funcionario.cargo?.nome_cargo || 'N/A'}`, 14, 42);
            doc.text(`Empresa: ${funcionario.empresa || 'N/A'}`, 14, 48);
            doc.text(`Data do Relatório: ${new Date().toLocaleDateString()}`, 14, 54);

            // Table Data
            const tableData = historico.map(item => [
                item.epi.nome_epi,
                item.epi.ca_numero,
                new Date(item.data_entrega).toLocaleDateString(),
                item.status === 'DEVOLVIDO' ? 'Devolvido' : 'Em uso'
            ]);

            console.log('Table data prepared', tableData);

            // Use autoTable function directly
            autoTable(doc, {
                startY: 60,
                head: [['EPI', 'CA', 'Data Entrega', 'Status']],
                body: tableData,
            });

            // Signature
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 150;
            doc.line(14, finalY + 40, 100, finalY + 40); // Line for signature
            doc.text('Assinatura do Funcionário', 14, finalY + 46);

            doc.line(110, finalY + 40, 196, finalY + 40); // Line for supervisor
            doc.text('Assinatura do Responsável', 110, finalY + 46);

            const fileName = `Relatorio_Devolucao_${funcionario.nome_completo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Save locally
            doc.save(fileName);
            console.log('PDF saved locally');

            // Upload to server
            const pdfBlob = doc.output('blob');
            const formData = new FormData();
            formData.append('file', pdfBlob, fileName);
            formData.append('funcionario_id', funcionario.id);
            formData.append('entrega_ids', JSON.stringify(historico.map(h => h.id)));

            await relatorioService.criar(formData);
            console.log('Report uploaded successfully');

            alert('Relatório gerado e salvo com sucesso!');

            // Refresh history to remove reported items
            loadHistorico(selectedFuncionarioReturn, 'DEVOLVIDO');

        } catch (err) {
            console.error('Error generating/uploading PDF:', err);
            alert('Erro ao gerar ou salvar o relatório PDF. Verifique o console.');
        }
    };

    // Form Data for Delivery
    const [formData, setFormData] = useState({
        funcionario_id: '',
        epi_id: '',
        data_entrega: new Date().toISOString().split('T')[0],
        validade_dias: '',
        ca: ''
    });

    // Selection for Return
    const [selectedFuncionarioReturn, setSelectedFuncionarioReturn] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    // Load history when employee is selected in Delivery tab
    useEffect(() => {
        if (activeTab === 'entregar' && formData.funcionario_id) {
            loadHistorico(formData.funcionario_id, 'ATIVO');
        } else if (activeTab === 'entregar') {
            setHistorico([]);
        }
    }, [formData.funcionario_id, activeTab]);

    // Load active EPIs when employee is selected in Return tab
    useEffect(() => {
        if (activeTab === 'devolver' && selectedFuncionarioReturn) {
            loadEpisAtivos(selectedFuncionarioReturn);
            loadHistorico(selectedFuncionarioReturn, 'DEVOLVIDO'); // Show returned history
        } else if (activeTab === 'devolver') {
            setEpisAtivos([]);
            setHistorico([]);
        }
    }, [selectedFuncionarioReturn, activeTab]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [funcsData, episData] = await Promise.all([
                funcionariosService.getFuncionarios({ ativo: true }),
                episService.getEpis()
            ]);
            setFuncionarios(funcsData);
            setEpis(episData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Falha ao carregar dados iniciais.');
        } finally {
            setLoading(false);
        }
    };

    const loadHistorico = async (funcionarioId, status = null) => {
        try {
            const data = await entregaService.listarPorFuncionario(funcionarioId, status);
            setHistorico(data);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
        }
    };

    const loadEpisAtivos = async (funcionarioId) => {
        try {
            const data = await entregaService.listarPorFuncionario(funcionarioId, 'ATIVO');
            setEpisAtivos(data);
        } catch (err) {
            console.error('Erro ao carregar EPIs ativos:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'epi_id') {
                const epi = epis.find(e => e.id === value);
                if (epi) {
                    newData.validade_dias = epi.validade_dias || 365;
                    newData.ca = epi.ca_numero;
                } else {
                    newData.validade_dias = '';
                    newData.ca = '';
                }
            }

            return newData;
        });
    };



    const handleDevolver = async (id) => {
        if (!window.confirm('Confirmar devolução deste EPI?')) return;

        try {
            await entregaService.devolver(id);
            setSuccess('EPI devolvido com sucesso!');

            // Refresh lists
            if (selectedFuncionarioReturn) {
                loadEpisAtivos(selectedFuncionarioReturn);
                loadHistorico(selectedFuncionarioReturn, 'DEVOLVIDO');
            }



        } catch (err) {
            console.error('Erro ao devolver EPI:', err);
            setError('Erro ao registrar devolução.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await entregaService.criar({
                funcionario_id: formData.funcionario_id,
                epi_id: formData.epi_id,
                data_entrega: new Date(formData.data_entrega).toISOString(),
                validade_dias: formData.validade_dias ? parseInt(formData.validade_dias) : null,
                quantidade: 1
            });

            setSuccess('EPI entregue com sucesso!');

            // Refresh data
            if (formData.funcionario_id) {
                loadHistorico(formData.funcionario_id, 'ATIVO');
            }

            // Reset form partial
            setFormData(prev => ({
                ...prev,
                epi_id: '',
                validade_dias: ''
            }));

        } catch (err) {
            console.error('Erro ao entregar EPI:', err);
            setError('Erro ao registrar entrega. Verifique os dados.');
        } finally {
            setSubmitting(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const getEpiCA = (epiId) => {
        const epi = epis.find(e => e.id === parseInt(epiId));
        return epi ? epi.ca_numero : '';
    };

    const getStatus = (entrega) => {
        if (entrega.status === 'DEVOLVIDO') return 'DEVOLVIDO';

        if (!entrega.validade_dias && !entrega.epi.validade_dias) return 'VÁLIDO';

        const validade = entrega.validade_dias || entrega.epi.validade_dias;
        const dataEntrega = new Date(entrega.data_entrega);
        // Reset time to midnight for accurate date comparison
        dataEntrega.setHours(0, 0, 0, 0);

        const dataVencimento = new Date(dataEntrega);
        dataVencimento.setDate(dataVencimento.getDate() + validade);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return hoje >= dataVencimento ? 'VENCIDO' : 'VÁLIDO';
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'VENCIDO': return 'vencido';
            case 'VÁLIDO': return 'valido';
            case 'DEVOLVIDO': return 'inativo';
            default: return '';
        }
    };



    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <div className="entrega-epis-layout">
            {/* Main Content */}
            <main className="main-content">
                <div className="content-header">
                    <h1>Gerenciamento de EPIs</h1>
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'entregar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('entregar')}
                        >
                            Entregar EPI
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'devolver' ? 'active' : ''}`}
                            onClick={() => setActiveTab('devolver')}
                        >
                            Registrar Devolução
                        </button>
                    </div>
                </div>

                {error && <div className="alert error">{error}</div>}
                {success && <div className="alert success">{success}</div>}

                {/* Tab Content: Entregar */}
                {activeTab === 'entregar' && (
                    <section className="form-section">
                        <div className="card">
                            <h3>Nova Entrega</h3>
                            <form onSubmit={handleSubmit} className="delivery-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Funcionário</label>
                                        <select
                                            name="funcionario_id"
                                            value={formData.funcionario_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecione um funcionário</option>
                                            {funcionarios.map(func => (
                                                <option key={func.id} value={func.id}>
                                                    {func.nome_completo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>EPI</label>
                                        <select
                                            name="epi_id"
                                            value={formData.epi_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecione o EPI</option>
                                            {epis.map(epi => (
                                                <option key={epi.id} value={epi.id}>
                                                    {epi.nome_epi}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>C.A</label>
                                        <input
                                            type="text"
                                            value={formData.ca || ''}
                                            readOnly
                                            className="readonly"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Data da Entrega</label>
                                        <input
                                            type="date"
                                            name="data_entrega"
                                            value={formData.data_entrega}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Validade (Dias)</label>
                                        <input
                                            type="number"
                                            name="validade_dias"
                                            value={formData.validade_dias}
                                            onChange={handleChange}
                                            placeholder="Ex: 365"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-primary" disabled={submitting}>
                                        {submitting ? 'Registrando...' : 'Confirmar Entrega'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                )}

                {/* Tab Content: Devolver */}
                {activeTab === 'devolver' && (
                    <section className="return-section">
                        <div className="card">
                            <h3>Registrar Devolução</h3>
                            <div className="form-group">
                                <label>Selecione o Funcionário</label>
                                <select
                                    value={selectedFuncionarioReturn}
                                    onChange={(e) => setSelectedFuncionarioReturn(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {funcionarios.map(func => (
                                        <option key={func.id} value={func.id}>
                                            {func.nome_completo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedFuncionarioReturn && (
                                <div className="active-epis-list">
                                    <h4>EPIs em Posse (Ativos)</h4>
                                    {episAtivos.length === 0 ? (
                                        <p className="text-muted">Este funcionário não possui EPIs ativos.</p>
                                    ) : (
                                        <div className="epi-grid">
                                            {episAtivos.map(entrega => (
                                                <div key={entrega.id} className="epi-card-active">
                                                    <div className="epi-info">
                                                        <strong>{entrega.epi.nome_epi}</strong>
                                                        <span> Entregue em: {new Date(entrega.data_entrega).toLocaleDateString()}</span>
                                                    </div>
                                                    <button
                                                        className="btn-return"
                                                        onClick={() => handleDevolver(entrega.id)}
                                                    >
                                                        Devolver
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Shared History Section */}
                <section className="history-section">
                    <div className="card">
                        <div className="card-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, border: 'none' }}>{activeTab === 'entregar' ? 'EPIs Entregues (Em uso)' : 'Histórico de Devoluções'}</h3>
                            {activeTab === 'devolver' && selectedFuncionarioReturn && (
                                <button
                                    className="btn-primary"
                                    onClick={handleGenerateReport}
                                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                >
                                    Gerar Relatório PDF
                                </button>
                            )}
                        </div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>EPI</th>
                                        <th>Data Entrega</th>
                                        <th>Validade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                {(activeTab === 'entregar' ? formData.funcionario_id : selectedFuncionarioReturn)
                                                    ? 'Nenhum histórico encontrado.'
                                                    : 'Selecione um funcionário para ver o histórico.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        historico.map(entrega => (
                                            <tr key={entrega.id}>
                                                <td>{entrega.epi.nome_epi}</td>
                                                <td>{new Date(entrega.data_entrega).toLocaleDateString()}</td>
                                                <td>{entrega.validade_dias || entrega.epi.validade_dias || '-'} dias</td>
                                                <td>
                                                    {(() => {
                                                        const status = getStatus(entrega);
                                                        return (
                                                            <span className={`status-badge ${getStatusClass(status)}`}>
                                                                {status}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EntregaEPIs;
