const API_BASE_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const funcionariosService = {
    createFuncionario: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/funcionarios`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar funcionário');
        }

        return response.json();
    },

    getCargos: async () => {
        const response = await fetch(`${API_BASE_URL}/api/cargos`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar cargos');
        }

        return response.json();
    },

    getFuncionarios: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/api/funcionarios${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar funcionários');
        }

        return response.json();
    }
};

export default funcionariosService;
