const API_BASE_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const cargosService = {
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

    createCargo: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/cargos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar cargo');
        }

        return response.json();
    },

    updateCargo: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/api/cargos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar cargo');
        }

        return response.json();
    },

    deleteCargo: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/cargos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir cargo');
        }

        return true; // 204 No Content
    }
};

export default cargosService;
