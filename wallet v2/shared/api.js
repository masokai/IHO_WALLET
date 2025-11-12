const API_BASE_URL = 'https://iho-wallet-backend2.onrender.com';

window.api = {
    async request(endpoint, options = {}) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`خطا: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async login(email, password) {
        return this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async getUsers() {
        return this.request('/api/users');
    },

    async getTransactions(email) {
        return this.request(`/api/transactions/${email}`);
    },

    async getGifts() {
        return this.request('/api/gifts');
    }
};
