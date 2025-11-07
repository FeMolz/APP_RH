const API_BASE_URL = 'http://localhost:3001';

export const getBirthdays = async () => {
    try {
        console.log('Iniciando requisição para buscar aniversariantes...');
        const response = await fetch(`${API_BASE_URL}/api/funcionarios/birthdays`);
        console.log('Resposta recebida:', response);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error('Failed to fetch birthdays: ' + response.status + ' ' + errorText);
        }
        const data = await response.json();
        console.log('Dados recebidos:', data);
        return data;
    } catch (error) {
        console.error('Erro detalhado ao buscar aniversariantes:', error);
        throw error;
    }
};