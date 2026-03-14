import React, { useState, useEffect } from 'react';
import entregaEpiService from '../services/entregaEpiService';
import authService from '../services/authService';
import './EntregaEPIs.css';
import { FaExclamationTriangle, FaCheck, FaHardHat } from 'react-icons/fa';

const EntregaEPIs = () => {
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    const [pendencias, setPendencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendencias();
    }, []);

    const fetchPendencias = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        setError(null);
        try {
            const data = await entregaEpiService.getPendentes();
            setPendencias(data || []);
            
            // Se o funcionário selecionado não existe mais na lista, limpa o filtro
            if (selectedFuncionarioId && data) {
                const stillExists = data.find(p => p.funcionario_id === selectedFuncionarioId);
                if (!stillExists) setSelectedFuncionarioId('');
            }
        } catch (err) {
            console.error('Erro ao buscar EPIs pendentes:', err);
            if (showLoader) setError('Falha ao carregar a lista de entregas pendentes.');
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const handleEntregar = async (funcionarioId, epiId) => {
        if (!isAdmin) return;

        // Otimização de Interface: Deseleciona funcionário se for o último EPI pendente dele
        const fIndex = pendencias.findIndex(f => f.funcionario_id === funcionarioId);
        if (fIndex >= 0 && pendencias[fIndex].epis_pendentes.length === 1 && selectedFuncionarioId === funcionarioId) {
            setSelectedFuncionarioId('');
        }

        // Atualização Otimista: Remove o item imediatamente para dar fluidez / produtividade máxima
        // Em vez de remover o EPI da lista, vamos atualizar o status dele localmente para EM_DIA e atualizar a data de expiracao provisoria
        setPendencias(prev => {
            return prev.map(f => {
                if (f.funcionario_id === funcionarioId) {
                    return {
                        ...f,
                        epis_pendentes: f.epis_pendentes.map(e => {
                            if (e.epi_id === epiId) {
                                const newExpDate = new Date();
                                newExpDate.setDate(newExpDate.getDate() + e.validade_dias);
                                return { ...e, status: 'EM_DIA', data_expiracao: newExpDate.toISOString() };
                            }
                            return e;
                        })
                    };
                }
                return f;
            });
        });

        try {
            const payload = {
                funcionario_id: funcionarioId,
                epi_id: epiId,
                data_entrega: new Date().toISOString()
            };
            await entregaEpiService.registrarEntrega(payload);
        } catch (err) {
            console.error('Erro ao registrar entrega:', err);
            // Em caso de falha silenciosa na API, resincronizamos silenciosamente a listagem
            fetchPendencias(false); 
        } 
    };

    if (loading) return <div className="loading-container">Carregando painel de entregas...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Calcular total de EPIs pendentes gerais para o título (apenas os que NÃO estão EM_DIA)
    let totalEpisPendentes = 0;
    pendencias.forEach(p => {
        totalEpisPendentes += p.epis_pendentes.filter(e => e.status !== 'EM_DIA').length;
    });

    // Transformar a estrutura agrupada em uma lista plana para a tabela baseando-se no filtro selecionado
    let displayData = [];
    pendencias.forEach(funcionario => {
        if (!selectedFuncionarioId || selectedFuncionarioId === funcionario.funcionario_id) {
            funcionario.epis_pendentes.forEach(epi => {
                displayData.push({
                    funcionario_id: funcionario.funcionario_id,
                    nome_completo: funcionario.nome_completo,
                    cargo_nome: funcionario.cargo_nome,
                    ...epi
                });
            });
        }
    });

    // Ordenar para que os itens EM_DIA fiquem por último
    displayData.sort((a, b) => {
        const order = { 'VENCIDO': 1, 'NUNCA_ENTREGUE': 2, 'EM_DIA': 3 };
        return order[a.status] - order[b.status];
    });

    return (
        <div className="entrega-dashboard">
            <h1 className="page-title"><FaHardHat style={{marginRight: '10px'}}/> Gestão de Entrega de EPIs</h1>

            <div className="filter-panel">
                <div className="panel-header-search">
                    <h3 className="panel-subtitle">
                        <FaExclamationTriangle color={totalEpisPendentes > 0 ? "#f39c12" : "#10b981"}/> 
                        {totalEpisPendentes === 0 ? "Todos os EPIs estão em dia" : `${totalEpisPendentes} EPI(s) pendente(s) ou vencido(s)`}
                    </h3>
                </div>

                {pendencias.length > 0 && (
                    <div className="filter-control">
                        <label htmlFor="funcionario-select">Filtrar por Funcionário:</label>
                        <select 
                            id="funcionario-select"
                            className="select-funcionario"
                            value={selectedFuncionarioId}
                            onChange={(e) => setSelectedFuncionarioId(e.target.value)}
                        >
                            <option value="">Selecione um Funcionário para ver os EPIs...</option>
                            {pendencias.map(p => {
                                const pendentesCount = p.epis_pendentes.filter(e => e.status !== 'EM_DIA').length;
                                return (
                                    <option key={p.funcionario_id} value={p.funcionario_id}>
                                        {p.nome_completo} ({pendentesCount > 0 ? `${pendentesCount} pendências` : 'Em dia'})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                )}
            </div>

            {pendencias.length === 0 ? (
                <div className="alert success">
                    Tudo em dia! Nenhum funcionário com EPIs pendentes ou vencidos.
                </div>
            ) : (
                <div className="details-panel slide-in">
                    <div className="table-responsive">
                        <table className="delivery-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Funcionário</th>
                                    <th>Nome do EPI</th>
                                    <th>Data Expiração</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.map((row, index) => (
                                    <tr key={`${row.funcionario_id}-${row.epi_id}-${index}`} className={`status-row ${row.status.toLowerCase()}`}>
                                        <td>
                                            <span className={`status-badge ${row.status.toLowerCase()}`}>
                                                {row.status === 'VENCIDO' ? 'VENCIDO' : row.status === 'EM_DIA' ? 'EM DIA' : 'PENDENTE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="funcionario-info">
                                                <strong>{row.nome_completo}</strong>
                                                <span className="cargo-tag-small">{row.cargo_nome}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="epi-info">
                                                <strong>{row.nome_epi}</strong>
                                                <span className="info-detail">C.A: {row.isento ? 'Isento' : row.ca_numero} | Ciclo: {row.validade_dias} dias</span>
                                            </div>
                                        </td>
                                        <td>{row.data_expiracao ? formatDate(row.data_expiracao) : '-'}</td>
                                        <td>
                                            <button 
                                                className={row.status === 'EM_DIA' ? 'btn-entregar secondary' : 'btn-entregar primary'}
                                                disabled={!isAdmin}
                                                onClick={() => handleEntregar(row.funcionario_id, row.epi_id)}
                                            >
                                                <FaCheck style={{marginRight: '5px'}}/> {row.status === 'EM_DIA' ? 'Renovar' : 'Entregar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntregaEPIs;
