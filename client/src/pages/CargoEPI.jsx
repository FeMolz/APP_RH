import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Vinculos.css';

const CargoEPI = () => {
    const [cargos, setCargos] = useState([]);
    const [epis, setEpis] = useState([]);
    const [selectedCargo, setSelectedCargo] = useState('');
    const [selectedEpis, setSelectedEpis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filterNome, setFilterNome] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCargo) {
            fetchVinculos(selectedCargo);
        } else {
            setSelectedEpis([]);
        }
    }, [selectedCargo]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [cargosRes, episRes] = await Promise.all([
                api.get('/api/cargos'),
                api.get('/api/epis')
            ]);
            // The API service returns the JSON response directly, not an axios-like object with a data property
            setCargos(cargosRes.filter(c => c.ativo !== false));
            setEpis(episRes.filter(e => e.ativo !== false));
        } catch (error) {
            console.error('Erro ao buscar dados iniciais:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVinculos = async (cargoId) => {
        try {
            const response = await api.get(`/api/vinculos/${cargoId}`);
            setSelectedEpis(response.epi_ids || []);
        } catch (error) {
            console.error('Erro ao buscar vínculos:', error);
            setSelectedEpis([]);
        }
    };

    const handleCheckboxChange = (epiId) => {
        setSelectedEpis(prev => {
            if (prev.includes(epiId)) {
                return prev.filter(id => id !== epiId);
            } else {
                return [...prev, epiId];
            }
        });
    };

    const handleSalvar = async () => {
        if (!selectedCargo) return;
        try {
            setSaving(true);
            await api.post(`/api/vinculos/${selectedCargo}`, {
                tipo: 'epi',
                ids: selectedEpis
            });
            alert('Vínculos salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar vínculos:', error);
            alert('Erro ao salvar vínculos.');
        } finally {
            setSaving(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilterNome(e.target.value);
    };

    const filteredEpis = epis.filter(epi =>
        filterNome === '' || (epi.nome_epi && epi.nome_epi.toLowerCase().includes(filterNome.toLowerCase()))
    );

    if (loading) return <div>Carregando...</div>;

    const uniqueEpiNames = [...new Set(epis.map(e => e.nome_epi))].sort();

    const formatDate = (dateString, isento) => {
        if (isento) return 'Isento';
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        localDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (localDate < today) {
            return <span style={{ color: 'red', fontWeight: 'bold' }}>VENCIDO</span>;
        }

        return localDate.toLocaleDateString();
    };

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
                        <div className="filter-select-container" style={{ minWidth: '250px' }}>
                            <input
                                type="text"
                                value={filterNome}
                                onChange={handleFilterChange}
                                className="vinculos-filter-input"
                                placeholder="Buscar EPI..."
                            />
                        </div>
                    )}
                </div>

                {selectedCargo ? (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px', textAlign: 'center' }}>Vínculo</th>
                                        <th>Nome do EPI</th>
                                        <th>Número do C.A.</th>
                                        <th>Validade C.A.</th>
                                        <th>Validade EPI (Dias)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEpis.length > 0 ? (
                                        filteredEpis.map(epi => (
                                            <tr key={epi.id}>
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        className="item-checkbox"
                                                        checked={selectedEpis.includes(epi.id)}
                                                        onChange={() => handleCheckboxChange(epi.id)}
                                                        style={{ cursor: 'pointer', margin: 0 }}
                                                    />
                                                </td>
                                                <td>{epi.nome_epi}</td>
                                                <td>{epi.isento ? 'Isento' : epi.ca_numero}</td>
                                                <td>{formatDate(epi.validade_ca, epi.isento)}</td>
                                                <td>{epi.validade_dias} dias</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-results">Nenhum EPI encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="vinculos-actions">
                            <button
                                className="btn-vincular"
                                onClick={handleSalvar}
                                disabled={saving}
                            >
                                {saving ? 'Salvando...' : 'Vincular EPIs'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ color: '#6c757d', textAlign: 'center', padding: '40px 0' }}>
                        Por favor, selecione um cargo acima para visualizar e gerenciar os EPIs vinculados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CargoEPI;
