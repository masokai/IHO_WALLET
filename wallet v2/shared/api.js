// API ساده و مطمئن
const API_BASE_URL = 'https://iho-wallet-backend2.onrender.com';

// ایجاد object api در global scope
var api = {
    async request(endpoint, options = {}) {
        try {
            console.log('📡 درخواست به:', API_BASE_URL + endpoint);
            const response = await fetch(API_BASE_URL + endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`خطای سرور: ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ خطای API:', error);
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
    },

    async health() {
        return this.request('/api/health');
    }
};

// تست اتصال هنگام بارگذاری
console.log('✅ API loaded, testing connection...');
api.health().then(result => {
    console.log('✅ اتصال به سرور برقرار است:', result);
}).catch(error => {
    console.error('❌ اتصال به سرور失败:', error);
});
