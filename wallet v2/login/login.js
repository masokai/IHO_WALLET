// توابع مخصوص صفحه لاگین - نسخه اصلاح شده
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('لطفاً ایمیل و رمز عبور را وارد کنید!');
        return;
    }
    
    try {
        console.log('در حال لاگین...', email);
        const result = await api.login(email, password);
        
        if (result.success) {
            // ذخیره کاربر در localStorage
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            console.log('لاگین موفق:', result.user);
            
            // انتقال به صفحه کاربر
            window.location.href = 'user/user.html';
        } else {
            alert('لاگین ناموفق!');
        }
    } catch (error) {
        console.error('خطای لاگین:', error);
        alert('خطا در ارتباط با سرور: ' + error.message);
    }
}

function adminLogin() {
    const password = document.getElementById('password').value;
    
    if (!password) {
        alert('لطفاً رمز عبور ادمین را وارد کنید!');
        return;
    }
    
    if (password === 'admin123') {
        try {
            // ایجاد کاربر ادمین
            const adminUser = { 
                email: 'admin@iho.com', 
                name: 'مدیر سیستم', 
                role: 'admin',
                balance: 1000000
            };
            
            // ذخیره در localStorage
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            console.log('ادمین وارد شد:', adminUser);
            
            // انتقال به صفحه ادمین
            window.location.href = 'admin/admin.html';
        } catch (error) {
            console.error('خطای ادمین:', error);
            alert('خطا در ورود ادمین: ' + error.message);
        }
    } else {
        alert('رمز عبور ادمین اشتباه است!');
    }
}

// بررسی اگر کاربر قبلاً لاگین کرده
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin/admin.html';
        } else if (currentUser.role === 'user') {
            window.location.href = 'user/user.html';
        }
    }
    
    // تست اتصال به سرور
    testConnection();
});

// تست اتصال به سرور
async function testConnection() {
    try {
        await api.request('/api/health');
        console.log('✅ اتصال به سرور برقرار است');
    } catch (error) {
        console.warn('⚠️ اتصال به سرور برقرار نیست:', error.message);
    }
}
