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

    getInativos: async () => {
        const response = await fetch(`${API_BASE_URL}/api/cargos/inativos`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar cargos inativos');
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
    },

    addQuesito: async (cargoId, quesitoId) => {
        const response = await fetch(`${API_BASE_URL}/api/cargos/${cargoId}/quesito`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ quesito_id: quesitoId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao adicionar quesito');
        }

        return response.json();
    },

    removeQuesito: async (cargoId, quesitoId) => {
        const response = await fetch(`${API_BASE_URL}/api/cargos/${cargoId}/quesito/${quesitoId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao remover quesito');
        }

        return true; // 204 No Content
    },

    getCargoById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/cargos/${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao buscar cargo');
        }

        return response.json();
    }
};

export default cargosService;
