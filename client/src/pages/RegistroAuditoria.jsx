import { useState, useEffect } from 'react';
import { relatorioService } from '../services/relatorioService';
import { FaHistory, FaSearch, FaFilePdf, FaDownload } from 'react-icons/fa';
import './RegistroAuditoria.css';

export default function RegistroAuditoria() {
    const [relatorios, setRelatorios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        carregarRelatorios();
    }, []);

    const carregarRelatorios = async () => {
        try {
            const dados = await relatorioService.listar();
            setRelatorios(dados);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id, nomeArquivo) => {
        try {
            const blob = await relatorioService.download(id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nomeArquivo.split('/').pop()); // Extract filename
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Erro ao baixar relatório:', error);
            alert('Erro ao baixar o relatório.');
        }
    };

    const filteredRelatorios = relatorios.filter(relatorio =>
        relatorio.funcionario.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="registro-auditoria-container">
            <div className="page-header">
                <h1>
                    <FaHistory /> Registro de Auditoria - Relatórios de EPIs
                </h1>
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por funcionário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data Gerado</th>
                                <th>Funcionário</th>
                                <th>Qtd EPIs</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRelatorios.map((relatorio) => (
                                <tr key={relatorio.id}>
                                    <td>{new Date(relatorio.data_geracao).toLocaleDateString()}</td>
                                    <td>
                                        <div className="funcionario-info">
                                            <span className="nome">{relatorio.funcionario.nome_completo}</span>
                                            <span className="cpf">{relatorio.funcionario.cpf}</span>
                                        </div>
                                    </td>
                                    <td>{relatorio.entregas.length}</td>
                                    <td>
                                        <button
                                            className="btn-download"
                                            onClick={() => handleDownload(relatorio.id, relatorio.caminho_arquivo)}
                                            title="Baixar PDF"
                                        >
                                            <FaFilePdf /> Baixar PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRelatorios.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="no-data">Nenhum relatório encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
