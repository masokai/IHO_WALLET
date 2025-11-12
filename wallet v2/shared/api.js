// تنظیمات API - نسخه کامل
const API_BASE_URL = 'https://iho-wallet-backend2.onrender.com';

class API {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = 10000; // 10 ثانیه
    }

    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `خطای سرور: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('اتصال به سرور timeout خورد');
            }
            throw error;
        }
    }

    // احراز هویت
    async login(email, password) {
        return this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    // کاربران
    async getUsers() {
        return this.request('/api/users');
    }

    async getUser(email) {
        return this.request(`/api/users/${email}`);
    }

    async addUser(userData) {
        return this.request('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // تراکنش‌ها
    async getTransactions(email) {
        return this.request(`/api/transactions/${email}`);
    }

    async getAllTransactions() {
        return this.request('/api/transactions');
    }

    async addTransaction(transaction) {
        return this.request('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
    }

    // هدایا
    async getGifts() {
        return this.request('/api/gifts');
    }

    async addGift(gift) {
        return this.request('/api/gifts', {
            method: 'POST',
            body: JSON.stringify(gift)
        });
    }

    // خرید هدیه
    async buyGift(user_email, gift_id) {
        return this.request('/api/buy-gift', {
            method: 'POST',
            body: JSON.stringify({ user_email, gift_id })
        });
    }

    // سلامت سرویس
    async health() {
        return this.request('/api/health');
    }
}

// ایجاد نمونه اصلی
const apiInstance = new API();

// export برای استفاده در ماژول‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API: apiInstance, api: apiInstance };
} else {
    window.API = apiInstance;
    window.api = apiInstance;
}

export default apiInstance;
export { apiInstance as api };
