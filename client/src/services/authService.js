const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const authService = {
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha no login');
        }

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            // O backend retorna 'usuario', precisamos tratar caso venha 'user' também
            localStorage.setItem('user', JSON.stringify(data.usuario || data.user));
        }
        return data;
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha no registro');
        }

        return response.json();
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default authService;
