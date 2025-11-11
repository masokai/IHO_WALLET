// مدیریت دیتابیس و داده‌ها - نسخه اصلاح شده
const adminPassword = 'admin123';

// بارگذاری داده‌ها از localStorage
function getUsers() {
    const users = JSON.parse(localStorage.getItem('wallet_users'));
    if (!users) {
        // ایجاد کاربران پیش‌فرض
        const defaultUsers = [
            { 
                id: 1,
                email: 'akhodabakhshiiho@gmail.com', 
                password: '1234', 
                name: 'امین خدابخشی', 
                role: 'user',
                avatar: null
            },
            { 
                id: 2,
                email: 'a.khazael.iho@gmail.com', 
                password: '1234', 
                name: 'علی خزاعی', 
                role: 'user',
                avatar: null
            },
            { 
                id: 3,
                email: 'b.bakhshayesh.iho@gmail.com', 
                password: '1234', 
                name: 'بابک بخشایش', 
                role: 'user',
                avatar: null
            }
        ];
        saveUsers(defaultUsers);
        return defaultUsers;
    }
    return users;
}

function getTransactions() {
    const transactions = JSON.parse(localStorage.getItem('wallet_transactions'));
    if (!transactions) {
        const defaultTransactions = [
            { 
                id: 1, 
                email: 'akhodabakhshiiho@gmail.com', 
                amount: 1000, 
                type: 'افزودن', 
                description: 'هدیه اول', 
                date: new Date().toLocaleDateString('fa-IR') 
            }
        ];
        saveTransactions(defaultTransactions);
        return defaultTransactions;
    }
    return transactions;
}

function getGifts() {
    const gifts = JSON.parse(localStorage.getItem('wallet_gifts'));
    if (!gifts) {
        const defaultGifts = [
            {
                id: 1,
                name: 'سینما - استخر - کافی‌شاپ',
                price: 250000,
                description: 'هدیه تفریحی برای اوقات فراغت',
                image: null
            },
            {
                id: 2,
                name: 'ایزنک و پینت بال',
                price: 550000,
                description: 'مجموعه تفریحی و ورزشی',
                image: null
            },
            {
                id: 3,
                name: 'آرایشی و بهداشتی',
                price: 830000,
                description: 'محصولات آرایشی و مراقبتی',
                image: null
            },
            {
                id: 4,
                name: 'باشگاه و گردشگری',
                price: 1150000,
                description: 'باشگاه ورزشی یا تور گردشگری',
                image: null
            },
            {
                id: 5,
                name: 'بن خرید هایپر مارکت',
                price: 1500000,
                description: 'بن خرید از هایپر مارکت‌های معتبر',
                image: null
            }
        ];
        saveGifts(defaultGifts);
        return defaultGifts;
    }
    return gifts;
}

// ذخیره داده‌ها
function saveUsers(users) {
    localStorage.setItem('wallet_users', JSON.stringify(users));
}

function saveTransactions(transactions) {
    localStorage.setItem('wallet_transactions', JSON.stringify(transactions));
}

function saveGifts(gifts) {
    localStorage.setItem('wallet_gifts', JSON.stringify(gifts));
}

// مدیریت کاربر فعلی
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// محاسبه موجودی کاربر
function getUserBalance(email) {
    const transactions = getTransactions();
    const userTransactions = transactions.filter(t => t.email === email);
    return userTransactions.reduce((sum, t) => sum + t.amount, 0);
}

// بررسی دسترسی ادمین
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// بررسی دسترسی کاربر
function isUser() {
    const user = getCurrentUser();
    return user && user.role === 'user';
}