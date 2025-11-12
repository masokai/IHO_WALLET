// سیستم دیتابیس کیف پول - نسخه کامل با API واقعی
let api;

// بارگذاری خودکار API
(async function() {
    try {
        // بارگذاری ماژول API
        const apiModule = await import('./api.js');
        api = apiModule.default || apiModule.api;
    } catch (error) {
        console.error('Failed to load API module:', error);
        // fallback به localStorage برای حالت آفلاین
        initLocalStorageFallback();
    }
})();

// حالت fallback با localStorage
function initLocalStorageFallback() {
    console.warn('Using localStorage fallback mode');
    // اینجا می‌تونی کد localStorage قبلی رو قرار بدی
}

// توابع اصلی دیتابیس - کامل و یکپارچه
async function getUsers() {
    try {
        if (!api) await loadAPI();
        const users = await api.getUsers();
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error('Error in getUsers:', error);
        throw new Error('خطا در دریافت لیست کاربران: ' + error.message);
    }
}

async function getUser(email) {
    try {
        if (!api) await loadAPI();
        return await api.getUser(email);
    } catch (error) {
        console.error('Error in getUser:', error);
        throw new Error('خطا در دریافت اطلاعات کاربر: ' + error.message);
    }
}

async function addUser(userData) {
    try {
        if (!api) await loadAPI();
        return await api.addUser(userData);
    } catch (error) {
        console.error('Error in addUser:', error);
        throw new Error('خطا در افزودن کاربر: ' + error.message);
    }
}

async function getTransactions(email = null) {
    try {
        if (!api) await loadAPI();
        
        if (email) {
            // تراکنش‌های کاربر خاص
            return await api.getTransactions(email);
        } else {
            // همه تراکنش‌ها (برای ادمین)
            return await api.getAllTransactions();
        }
    } catch (error) {
        console.error('Error in getTransactions:', error);
        throw new Error('خطا در دریافت تراکنش‌ها: ' + error.message);
    }
}

async function addTransaction(transactionData) {
    try {
        if (!api) await loadAPI();
        
        // اعتبارسنجی داده‌ها
        if (!transactionData.user_email || transactionData.amount === undefined) {
            throw new Error('ایمیل کاربر و مقدار تراکنش الزامی است');
        }
        
        return await api.addTransaction(transactionData);
    } catch (error) {
        console.error('Error in addTransaction:', error);
        throw new Error('خطا در ثبت تراکنش: ' + error.message);
    }
}

async function getGifts() {
    try {
        if (!api) await loadAPI();
        const gifts = await api.getGifts();
        return Array.isArray(gifts) ? gifts : [];
    } catch (error) {
        console.error('Error in getGifts:', error);
        throw new Error('خطا در دریافت لیست هدایا: ' + error.message);
    }
}

async function addGift(giftData) {
    try {
        if (!api) await loadAPI();
        
        // اعتبارسنجی داده‌ها
        if (!giftData.name || !giftData.price) {
            throw new Error('نام و قیمت هدیه الزامی است');
        }
        
        return await api.addGift(giftData);
    } catch (error) {
        console.error('Error in addGift:', error);
        throw new Error('خطا در افزودن هدیه: ' + error.message);
    }
}

async function buyGift(user_email, gift_id) {
    try {
        if (!api) await loadAPI();
        
        // اعتبارسنجی داده‌ها
        if (!user_email || !gift_id) {
            throw new Error('ایمیل کاربر و شناسه هدیه الزامی است');
        }
        
        return await api.buyGift(user_email, gift_id);
    } catch (error) {
        console.error('Error in buyGift:', error);
        throw new Error('خطا در خرید هدیه: ' + error.message);
    }
}

// محاسبه موجودی کاربر
async function getUserBalance(email) {
    try {
        if (!api) await loadAPI();
        const user = await api.getUser(email);
        return user ? (user.balance || 0) : 0;
    } catch (error) {
        console.error('Error in getUserBalance:', error);
        return 0;
    }
}

// مدیریت کاربر فعلی
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing current user:', error);
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        console.error('Error setting current user:', error);
    }
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// افزودن اعتبار به کاربر (برای ادمین)
async function addCreditToUser(user_email, amount, description = 'افزودن اعتبار توسط مدیر') {
    try {
        const currentUser = getCurrentUser();
        
        const transactionData = {
            user_email: user_email,
            amount: amount,
            type: 'افزودن اعتبار',
            description: description,
            admin_email: currentUser ? currentUser.email : 'system'
        };
        
        return await addTransaction(transactionData);
    } catch (error) {
        console.error('Error in addCreditToUser:', error);
        throw error;
    }
}

// تابع کمکی برای بارگذاری API
async function loadAPI() {
    if (!api) {
        try {
            const apiModule = await import('./api.js');
            api = apiModule.default || apiModule.api;
        } catch (error) {
            throw new Error('API module not available');
        }
    }
    return api;
}

// تست اتصال به سرور
async function testConnection() {
    try {
        if (!api) await loadAPI();
        const health = await api.request('/api/health');
        return {
            success: true,
            message: 'اتصال به سرور برقرار است',
            data: health
        };
    } catch (error) {
        return {
            success: false,
            message: 'خطا در اتصال به سرور',
            error: error.message
        };
    }
}

// توابع قدیمی برای سازگاری (اختیاری)
async function saveUsers(users) {
    console.warn('saveUsers is deprecated - users are managed via API');
    return Promise.resolve();
}

async function saveTransactions(transactions) {
    console.warn('saveTransactions is deprecated - transactions are managed via API');
    return Promise.resolve();
}

async function saveGifts(gifts) {
    console.warn('saveGifts is deprecated - gifts are managed via API');
    return Promise.resolve();
}
