import React, { useState, useEffect } from 'react';
import { getBirthdays } from '../services/birthdayService';
import './BirthdayGallery.css';

export default function BirthdayGallery() {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBirthdays();
            setBirthdays(data);
        } catch (err) {
            setError('Erro ao carregar aniversariantes. Tente novamente mais tarde.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="birthday_container">
                <div className="loading_state">Carregando aniversariantes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="birthday_container">
                <div className="error_state">
                    {error}
                    <button onClick={fetchBirthdays} className="retry_button">
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="birthday_container">
            <h1>Datas de Aniversário</h1>
            <div className="table_container">
                {birthdays.length === 0 ? (
                    <div className="empty_state">
                        Nenhum aniversariante cadastrado
                    </div>
                ) : (
                    <table className="birthday_table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Data de Nascimento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {birthdays.map(person => (
                                <tr key={person.id}>
                                    <td>{person.nome_completo}</td>
                                    <td>{new Date(person.data_nascimento).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit'
                                    })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
