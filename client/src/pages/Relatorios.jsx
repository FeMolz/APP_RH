import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf, FaSearch } from 'react-icons/fa';
import { IoDocumentText } from 'react-icons/io5';
import funcionariosService from '../services/funcionariosService';
import entregaEpiService from '../services/entregaEpiService';
import './Relatorios.css';

const Relatorios = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFuncionarios = async () => {
            try {
                const data = await funcionariosService.getFuncionarios();
                setFuncionarios(data || []);
            } catch (err) {
                console.error('Erro ao buscar funcionários:', err);
                setError('Não foi possível carregar a lista de funcionários.');
            }
        };
        fetchFuncionarios();
    }, []);

    const handleFuncionarioChange = (e) => {
        const id = e.target.value;
        setSelectedFuncionarioId(id);
        const func = funcionarios.find(f => f.id === id);
        if (func) {
            setEmpresa(func.empresa || '');
        } else {
            setEmpresa('');
        }
    };

    useEffect(() => {
        const fetchRelatorio = async () => {
            if (!selectedFuncionarioId || !dataInicio || !dataFim) {
                setResultados([]);
                setError('');
                return;
            }

            if (new Date(dataInicio) > new Date(dataFim)) {
                setError('A Data de Início não pode ser maior que a Data de Fim.');
                setResultados([]);
                return;
            }

            setError('');
            setLoading(true);
            try {
                const data = await entregaEpiService.getRelatorio(selectedFuncionarioId, dataInicio, dataFim);
                setResultados(data || []);
            } catch (err) {
                console.error('Erro ao buscar relatório:', err);
                setError('Falha ao buscar as entregas de EPI para o período selecionado.');
            } finally {
                setLoading(false);
            }
        };

        fetchRelatorio();
    }, [selectedFuncionarioId, dataInicio, dataFim]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const handleGeneratePDF = () => {
        if (resultados.length === 0) return;

        const doc = new jsPDF();
        const func = funcionarios.find(f => f.id === selectedFuncionarioId);
        if (!func) return;

        doc.setFontSize(18);
        doc.text('Relatório de Entregas de EPI', 14, 22);

        doc.setFontSize(12);
        doc.text(`Funcionário: ${func.nome_completo}`, 14, 32);
        doc.text(`Empresa: ${func.empresa || 'N/A'}`, 14, 40);
        
        const dataInicioStr = dataInicio.split('-').reverse().join('/');
        const dataFimStr = dataFim.split('-').reverse().join('/');
        doc.text(`Período de ${dataInicioStr} a ${dataFimStr}`, 14, 48);

        const tableColumn = ["Nome do EPI", "C.A.", "Data de Entrega", "Validade (Dias)", "Status"];
        const tableRows = [];

        resultados.forEach(entrega => {
            const epiNome = entrega.epi?.nome_epi || '-';
            const caNum = entrega.epi?.isento ? 'Isento' : (entrega.epi?.ca_numero || '-');
            const dtEntrega = formatDate(entrega.data_entrega);
            const validade = entrega.epi?.validade_dias || '-';
            
            let status = 'EM DIA';
            if (entrega.data_vencimento && new Date(entrega.data_vencimento) < new Date()) {
                status = 'VENCIDO';
            }

            tableRows.push([epiNome, caNum, dtEntrega, validade, status]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            headStyles: { fillColor: [47, 64, 80] },
            alternateRowStyles: { fillColor: [248, 249, 250] },
        });

        const finalY = doc.lastAutoTable.finalY || 55;

        doc.setLineWidth(0.5);
        doc.line(20, finalY + 40, 90, finalY + 40);
        doc.text('Assinatura da Empresa', 35, finalY + 48);

        doc.line(120, finalY + 40, 190, finalY + 40);
        doc.text('Assinatura do Funcionário', 130, finalY + 48);

        const pdfName = `Relatorio_EPIs-${func.nome_completo.replace(/\s+/g, '_')}.pdf`;
        doc.save(pdfName);
    };

    return (
        <div className="relatorios-container">
            <div className="dashboard-header">
                <h1><IoDocumentText /> Relatórios de Entrega de EPI</h1>
                {resultados.length > 0 && (
                    <button 
                        className="btn-add" 
                        onClick={handleGeneratePDF} 
                        style={{ backgroundColor: '#dc3545', color: '#fff' }} // Red color variant for PDF output
                    >
                        <FaFilePdf /> Gerar PDF
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-panel">
                <div className="form-row" style={{ alignItems: 'flex-end', marginBottom: 0 }}>
                    <div className="form-group">
                        <label htmlFor="funcionario">Funcionário</label>
                        <select
                            id="funcionario"
                            value={selectedFuncionarioId}
                            onChange={handleFuncionarioChange}
                            className="form-control"
                        >
                            <option value="">Selecione um funcionário...</option>
                            {funcionarios.map(f => (
                                <option key={f.id} value={f.id}>
                                    {f.nome_completo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="empresa">Empresa</label>
                        <input
                            type="text"
                            id="empresa"
                            value={empresa}
                            disabled
                            className="form-control"
                            placeholder="Auto-preenchido"
                            style={{ backgroundColor: '#e9ecef' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="data_inicio">Data de Início</label>
                        <input
                            type="date"
                            id="data_inicio"
                            value={dataInicio}
                            className="form-control"
                            onChange={e => setDataInicio(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="data_fim">Data de Fim</label>
                        <input
                            type="date"
                            id="data_fim"
                            value={dataFim}
                            className="form-control"
                            onChange={e => setDataFim(e.target.value)}
                        />
                    </div>


                </div>
            </div>

            <div className="table-container">
                {resultados.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome do EPI</th>
                                <th>C.A.</th>
                                <th>Data de Entrega</th>
                                <th>Vencimento</th>
                                <th>Status Atual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((entrega) => {
                                const venci = new Date(entrega.data_vencimento);
                                const isVencido = venci < new Date();
                                return (
                                    <tr key={entrega.id}>
                                        <td><strong>{entrega.epi?.nome_epi || '-'}</strong></td>
                                        <td>{entrega.epi?.isento ? 'Isento' : (entrega.epi?.ca_numero || '-')}</td>
                                        <td>{formatDate(entrega.data_entrega)}</td>
                                        <td>{formatDate(entrega.data_vencimento)}</td>
                                        <td>
                                            <span className={`status-badge ${isVencido ? 'vencido' : 'em_dia'}`}>
                                                {isVencido ? 'VENCIDO' : 'EM DIA'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    !loading && selectedFuncionarioId && dataInicio && dataFim && (
                        <div className="no-results">
                            Nenhum registro de entrega de EPI encontrado para este funcionário neste período.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Relatorios;
