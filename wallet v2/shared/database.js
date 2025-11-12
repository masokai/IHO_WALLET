// سیستم دیتابیس - استفاده از API موجود

async function getUsers() {
    try {
        return await api.getUsers();
    } catch (error) {
        console.error('Error in getUsers:', error);
        return [];
    }
}

async function getUser(email) {
    try {
        return await api.getUser(email);
    } catch (error) {
        console.error('Error in getUser:', error);
        throw error;
    }
}

async function getTransactions(email = null) {
    try {
        if (email) {
            return await api.getTransactions(email);
        } else {
            return await api.getAllTransactions();
        }
    } catch (error) {
        console.error('Error in getTransactions:', error);
        return [];
    }
}

async function addTransaction(transactionData) {
    try {
        return await api.request('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    } catch (error) {
        console.error('Error in addTransaction:', error);
        throw error;
    }
}

async function getGifts() {
    try {
        return await api.getGifts();
    } catch (error) {
        console.error('Error in getGifts:', error);
        return [];
    }
}

async function getUserBalance(email) {
    try {
        const user = await getUser(email);
        return user ? user.balance : 0;
    } catch (error) {
        console.error('Error in getUserBalance:', error);
        return 0;
    }
}

// مدیریت کاربر فعلی
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// توابع ادمین
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
        console.error('Error in addCreditToUser:', error);
        throw error;
    }
}

async function buyGift(user_email, gift_id) {
    try {
        return await api.request('/api/buy-gift', {
            method: 'POST',
            body: JSON.stringify({ user_email, gift_id })
        });
    } catch (error) {
        console.error('Error in buyGift:', error);
        throw error;
    }
}
