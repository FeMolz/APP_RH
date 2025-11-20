const API_BASE_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const episService = {
    getEpis: async () => {
        const response = await fetch(`${API_BASE_URL}/api/epis`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar EPIs');
        }

        return response.json();
    },

    getEpiById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/epis/${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar EPI');
        }

        return response.json();
    },

    createEpi: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/epis`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar EPI');
        }

        return response.json();
    },

    updateEpi: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/api/epis/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar EPI');
        }

        return response.json();
    },

    deleteEpi: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/epis/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir EPI');
        }

        return true; // 204 No Content
    }
};

export default episService;
