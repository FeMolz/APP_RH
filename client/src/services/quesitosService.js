const API_BASE_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const quesitosService = {
    getQuesitos: async () => {
        const response = await fetch(`${API_BASE_URL}/api/quesitos`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar quesitos');
        }

        return response.json();
    },

    createQuesito: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/quesitos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar quesito');
        }

        return response.json();
    },

    updateQuesito: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/api/quesitos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar quesito');
        }

        return response.json();
    },

    deleteQuesito: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/quesitos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir quesito');
        }

        return true; // 204 No Content
    }
};

export default quesitosService;
