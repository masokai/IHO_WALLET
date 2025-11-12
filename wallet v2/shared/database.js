// سیستم دیتابیس - استفاده از API موجود بدون تعریف مجدد

// توابع اصلی دیتابیس
async function getUsers() {
    try {
        console.log('📡 دریافت لیست کاربران...');
        return await api.getUsers();
    } catch (error) {
        console.error('❌ خطا در دریافت کاربران:', error);
        return [];
    }
}

async function getUser(email) {
    try {
        console.log('📡 دریافت اطلاعات کاربر:', email);
        return await api.getUser(email);
    } catch (error) {
        console.error('❌ خطا در دریافت کاربر:', error);
        throw new Error('خطا در دریافت اطلاعات کاربر');
    }
}

async function getTransactions(email = null) {
    try {
        if (email) {
            console.log('📡 دریافت تراکنش‌های کاربر:', email);
            return await api.getTransactions(email);
        } else {
            console.log('📡 دریافت همه تراکنش‌ها');
            const allUsers = await getUsers();
            let allTransactions = [];
            
            for (const user of allUsers) {
                try {
                    const userTransactions = await api.getTransactions(user.email);
                    allTransactions = allTransactions.concat(userTransactions);
                } catch (error) {
                    console.warn('خطا در دریافت تراکنش‌های کاربر:', user.email, error);
                }
            }
            
            return allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    } catch (error) {
        console.error('❌ خطا در دریافت تراکنش‌ها:', error);
        return [];
    }
}

async function addTransaction(transactionData) {
    try {
        console.log('📡 ثبت تراکنش جدید:', transactionData);
        return await api.request('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    } catch (error) {
        console.error('❌ خطا در ثبت تراکنش:', error);
        throw error;
    }
}

async function getGifts() {
    try {
        console.log('📡 دریافت لیست هدایا...');
        return await api.getGifts();
    } catch (error) {
        console.error('❌ خطا در دریافت هدایا:', error);
        return [];
    }
}

async function getUserBalance(email) {
    try {
        console.log('📡 دریافت موجودی کاربر:', email);
        const user = await getUser(email);
        return user ? (user.balance || 0) : 0;
    } catch (error) {
        console.error('❌ خطا در دریافت موجودی:', error);
        return 0;
    }
}

// مدیریت کاربر فعلی
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('❌ خطا در خواندن کاربر جاری:', error);
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('✅ کاربر جاری ذخیره شد:', user.email);
    } catch (error) {
        console.error('❌ خطا در ذخیره کاربر جاری:', error);
    }
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
    console.log('✅ کاربر جاری حذف شد');
}

// توابع کمکی برای ادمین
async function addCreditToUser(user_email, amount, description = 'افزودن اعتبار توسط مدیر') {
    try {
        const transactionData = {
            user_email: user_email,
            amount: amount,
            type: 'افزودن اعتبار',
            description: description
        };
        
        return await addTransaction(transactionData);
    } catch (error) {
        console.error('❌ خطا در افزودن اعتبار:', error);
        throw error;
    }
}

async function buyGift(user_email, gift_id) {
    try {
        console.log('📡 خرید هدیه:', { user_email, gift_id });
        return await api.request('/api/buy-gift', {
            method: 'POST',
            body: JSON.stringify({ user_email, gift_id })
        });
    } catch (error) {
        console.error('❌ خطا در خرید هدیه:', error);
        throw error;
    }
}

console.log('✅ database.js loaded successfully');
