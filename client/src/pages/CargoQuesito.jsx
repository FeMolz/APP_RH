import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Vinculos.css';

const CargoQuesito = () => {
    const [cargos, setCargos] = useState([]);
    const [quesitos, setQuesitos] = useState([]);
    const [selectedCargo, setSelectedCargo] = useState('');
    const [selectedQuesitos, setSelectedQuesitos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filterBloco, setFilterBloco] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCargo) {
            fetchVinculos(selectedCargo);
        } else {
            setSelectedQuesitos([]);
        }
    }, [selectedCargo]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [cargosRes, quesitosRes] = await Promise.all([
                api.get('/api/cargos'),
                api.get('/api/quesitos')
            ]);
            setCargos(cargosRes.filter(c => c.ativo !== false));
            setQuesitos(quesitosRes);
        } catch (error) {
            console.error('Erro ao buscar dados iniciais:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVinculos = async (cargoId) => {
        try {
            const response = await api.get(`/api/vinculos/${cargoId}`);
            setSelectedQuesitos(response.quesito_ids || []);
        } catch (error) {
            console.error('Erro ao buscar vínculos:', error);
            setSelectedQuesitos([]);
        }
    };

    const handleCheckboxChange = (quesitoId) => {
        setSelectedQuesitos(prev => {
            if (prev.includes(quesitoId)) {
                return prev.filter(id => id !== quesitoId);
            } else {
                return [...prev, quesitoId];
            }
        });
    };

    const handleSalvar = async () => {
        if (!selectedCargo) return;
        try {
            setSaving(true);
            await api.post(`/api/vinculos/${selectedCargo}`, {
                tipo: 'quesito',
                ids: selectedQuesitos
            });
            alert('Vínculos salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar vínculos:', error);
            alert('Erro ao salvar vínculos.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    const blocosUnicos = [...new Set(quesitos.map(q => q.bloco || 'Sem Bloco Especificado'))].sort();

    const quesitosFiltrados = filterBloco
        ? quesitos.filter(q => (q.bloco || 'Sem Bloco Especificado') === filterBloco)
        : quesitos;

    // Group quesitos by bloco
    const agrupadosPorBloco = quesitosFiltrados.reduce((acc, curr) => {
        const bloco = curr.bloco || 'Sem Bloco Especificado';
        if (!acc[bloco]) acc[bloco] = [];
        acc[bloco].push(curr);
        return acc;
    }, {});

    return (
        <div className="vinculos-dashboard">
            <div className="vinculos-content">
                <div className="vinculos-header">
                    <div className="cargo-select-container">
                        <select
                            value={selectedCargo}
                            onChange={(e) => setSelectedCargo(e.target.value)}
                        >
                            <option value="">Selecione um Cargo</option>
                            {cargos.map(cargo => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.nome_cargo}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedCargo && (
                        <div className="filter-select-container">
                            <select
                                value={filterBloco}
                                onChange={(e) => setFilterBloco(e.target.value)}
                                className="vinculos-filter-select"
                            >
                                <option value="">Todos os Blocos</option>
                                {blocosUnicos.map((bloco, index) => (
                                    <option key={index} value={bloco}>{bloco}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {selectedCargo ? (
                    <>
                        {Object.keys(agrupadosPorBloco).map(bloco => (
                            <div key={bloco} style={{ marginBottom: '30px' }}>
                                <h3 style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px', marginTop: '30px', color: '#495057' }}>
                                    {bloco}
                                </h3>
                                <div className="table-container">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px', textAlign: 'center' }}>Vínculo</th>
                                                <th>Descrição do Quesito</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {agrupadosPorBloco[bloco].map(quesito => (
                                                <tr key={quesito.id}>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            className="item-checkbox"
                                                            checked={selectedQuesitos.includes(quesito.id)}
                                                            onChange={() => handleCheckboxChange(quesito.id)}
                                                            style={{ cursor: 'pointer', margin: 0 }}
                                                        />
                                                    </td>
                                                    <td>{quesito.descricao_quesito}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}

                        <div className="vinculos-actions">
                            <button
                                className="btn-vincular"
                                onClick={handleSalvar}
                                disabled={saving}
                            >
                                {saving ? 'Salvando...' : 'Vincular Quesitos'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ color: '#6c757d', textAlign: 'center', padding: '40px 0' }}>
                        Por favor, selecione um cargo acima para visualizar e gerenciar os Quesitos vinculados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CargoQuesito;
