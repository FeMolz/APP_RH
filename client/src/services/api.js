const API_BASE_URL = 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    // Some responses might be 204 No Content (null body)
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const api = {
    get: async (endpoint, params = {}, options = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
            headers: getAuthHeaders(),
            ...options
        });

        if (options.responseType === 'blob') {
            if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
            return response.blob();
        }

        return handleResponse(response);
    },

    post: async (endpoint, data, options = {}) => {
        const headers = getAuthHeaders();
        let body = JSON.stringify(data);

        if (data instanceof FormData) {
            delete headers['Content-Type']; // Let browser set boundary
            body = data;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { ...headers, ...options.headers },
            body
        });

        return handleResponse(response);
    },

    put: async (endpoint, data) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    }
};
