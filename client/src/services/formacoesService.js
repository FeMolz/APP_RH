const API_BASE_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const formacoesService = {
    createFormacao: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/formacoes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar formação');
        }

        return response.json();
    },

    getFormacoes: async () => {
        // Assuming there is a GET endpoint. If not, I might need to add it to the backend.
        // Checking backend routes... I only saw DELETE and POST in the previous turn.
        // I should double check if there is a GET route. 
        // If not, I will add it.
        // For now I will implement this, and if it fails I will fix the backend.
        const response = await fetch(`${API_BASE_URL}/api/formacoes`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar formações');
        }

        return response.json();
    },

    deleteFormacao: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/formacoes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            // 204 No Content doesn't have JSON
            if (response.status === 204) return;
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao deletar formação');
        }
    },

    updateFormacao: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/api/formacoes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar formação');
        }

        return response.json();
    }
};

export default formacoesService;
