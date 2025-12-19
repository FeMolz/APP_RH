import React, { useState, useEffect } from 'react';
import { entregaService } from '../services/entregaService';
import episService from '../services/episService';
import funcionariosService from '../services/funcionariosService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { relatorioService } from '../services/relatorioService';
import './EntregaEPIs.css';

const EntregaEPIs = () => {
    const [activeTab, setActiveTab] = useState('entregar'); // 'entregar' | 'relatorios'
    const [funcionarios, setFuncionarios] = useState([]);
    const [epis, setEpis] = useState([]);
    const [historico, setHistorico] = useState([]);

    // Report State
    const [selectedFuncionarioReport, setSelectedFuncionarioReport] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportPreview, setReportPreview] = useState([]);

    const [formData, setFormData] = useState({
        funcionario_id: '',
        epi_id: '',
        data_entrega: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD in local time
        validade_dias: '',
        ca: ''
    });

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
        } else if (activeTab === 'relatorios') {
            setHistorico([]); // Clear history when switching to reports
        }
    }, [formData.funcionario_id, activeTab]);

    // Live Preview for Report
    useEffect(() => {
        const fetchPreview = async () => {
            if (activeTab === 'relatorios' && selectedFuncionarioReport && startDate && endDate) {
                try {
                    const data = await entregaService.listarParaRelatorio(selectedFuncionarioReport, startDate, endDate);
                    setReportPreview(data);
                } catch (err) {
                    console.error('Error fetching report preview:', err);
                    setReportPreview([]);
                }
            } else {
                setReportPreview([]);
            }
        };

        const timeoutId = setTimeout(fetchPreview, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [activeTab, selectedFuncionarioReport, startDate, endDate]);

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

    const handleGenerateReport = async () => {
        if (!selectedFuncionarioReport || !startDate || !endDate) {
            alert('Por favor, selecione o funcionário e o período.');
            return;
        }

        // Use cached preview data if available to avoid re-fetch, or fetch if empty
        let dataToPrint = reportPreview;
        if (dataToPrint.length === 0) {
            try {
                dataToPrint = await entregaService.listarParaRelatorio(selectedFuncionarioReport, startDate, endDate);
            } catch (err) {
                console.error('Error fetching report:', err);
                alert('Erro ao buscar dados para o relatório.');
                return;
            }
        }

        if (!dataToPrint || dataToPrint.length === 0) {
            alert('Nenhuma entrega encontrada para este período.');
            return;
        }

        try {
            const funcionario = funcionarios.find(f => f.id === selectedFuncionarioReport);

            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.text('Relatório de Entregas de EPIs', 14, 20);

            doc.setFontSize(12);
            doc.text(`Funcionário: ${funcionario?.nome_completo || 'N/A'}`, 14, 30);
            doc.text(`CPF: ${funcionario?.cpf || 'N/A'}`, 14, 36);
            doc.text(`Período: ${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}`, 14, 42);
            doc.text(`Emissão: ${new Date().toLocaleDateString()}`, 14, 48);

            // Table Data
            const tableData = dataToPrint.map(item => [
                item.epi.nome_epi,
                item.epi.ca_numero,
                new Date(item.data_entrega).toLocaleDateString(),
                item.quantidade,
                item.validade_dias || item.epi.validade_dias || '-'
            ]);

            autoTable(doc, {
                startY: 55,
                head: [['EPI', 'CA', 'Data Entrega', 'Qtd', 'Validade (Dias)']],
                body: tableData,
            });

            // Signatures
            const finalY = doc.lastAutoTable.finalY || 150;

            doc.line(14, finalY + 40, 90, finalY + 40);
            doc.text('Assinatura do Funcionário', 14, finalY + 46);

            doc.line(110, finalY + 40, 190, finalY + 40);
            doc.text('Assinatura do Responsável', 110, finalY + 46);

            const fileName = `Relatorio_EPIs_${funcionario?.nome_completo.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`;

            // Save locally
            doc.save(fileName);

            // Upload to server (restore functionality)
            if (relatorioService && relatorioService.criar) {
                try {
                    const pdfBlob = doc.output('blob');
                    const formDataReport = new FormData();
                    formDataReport.append('file', pdfBlob, fileName);
                    formDataReport.append('funcionario_id', funcionario.id);
                    // Assuming the backend expects 'entrega_ids' if we want to associate these deliveries with the report
                    // formDataReport.append('entrega_ids', JSON.stringify(dataToPrint.map(h => h.id)));

                    await relatorioService.criar(formDataReport);
                    console.log('Report uploaded successfully');
                } catch (uploadErr) {
                    console.warn('Could not upload report to server:', uploadErr);
                    // Don't block the user if upload fails, as they have the PDF
                }
            }

        } catch (err) {
            console.error('Erro ao gerar relatório:', err);
            alert('Erro ao gerar relatório PDF.');
        }
    };

    const getStatus = (entrega) => {
        if (entrega.status === 'DEVOLVIDO') return 'DEVOLVIDO';

        if (!entrega.validade_dias && !entrega.epi.validade_dias) return 'VÁLIDO';

        const validade = entrega.validade_dias || entrega.epi.validade_dias;
        const dataEntrega = new Date(entrega.data_entrega);
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
                            className={`tab-btn ${activeTab === 'relatorios' ? 'active' : ''}`}
                            onClick={() => setActiveTab('relatorios')}
                        >
                            Relatórios de Entregas
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

                        {/* History for Entregar Tab */}
                        <div className="card mt-4">
                            <h3>EPIs Ativos (Em uso)</h3>
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
                                                    {formData.funcionario_id
                                                        ? 'Nenhum EPI ativo encontrado.'
                                                        : 'Selecione um funcionário para ver os EPIs ativos.'}
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
                )}

                {/* Tab Content: Relatórios */}
                {activeTab === 'relatorios' && (
                    <section className="report-section">
                        <div className="card">
                            <h3>Emissão de Relatório de Entregas</h3>
                            <div className="report-form-grid">
                                <div className="form-group">
                                    <label>Funcionário</label>
                                    <select
                                        value={selectedFuncionarioReport}
                                        onChange={(e) => setSelectedFuncionarioReport(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {funcionarios.map(func => (
                                            <option key={func.id} value={func.id}>
                                                {func.nome_completo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Data Início</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data Fim</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        className="btn-primary"
                                        onClick={handleGenerateReport}
                                    >
                                        Gerar Relatório PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="card mt-4">
                            <h3>Pré-visualização do Período</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>EPI</th>
                                            <th>CA</th>
                                            <th>Data Entrega</th>
                                            <th>Quantidade</th>
                                            <th>Validade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportPreview.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    {(selectedFuncionarioReport && startDate && endDate)
                                                        ? 'Nenhuma entrega encontrada neste período.'
                                                        : 'Selecione funcionário e período para visualizar.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            reportPreview.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.epi.nome_epi}</td>
                                                    <td>{item.epi.ca_numero}</td>
                                                    <td>{new Date(item.data_entrega).toLocaleDateString()}</td>
                                                    <td>{item.quantidade}</td>
                                                    <td>{item.validade_dias || item.epi.validade_dias || '-'} dias</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default EntregaEPIs;
