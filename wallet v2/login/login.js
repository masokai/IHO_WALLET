// توابع مخصوص صفحه لاگین - نسخه اصلاح شده
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('لطفاً ایمیل و رمز عبور را وارد کنید!');
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // ذخیره کاربر در session
        setCurrentUser(user);
        // انتقال به صفحه کاربر
        window.location.href = 'user/user.html';
    } else {
        alert('ایمیل یا رمز عبور اشتباه است!');
    }
}

function adminLogin() {
    const password = document.getElementById('password').value;
    
    if (!password) {
        alert('لطفاً رمز عبور ادمین را وارد کنید!');
        return;
    }
    
    if (password === adminPassword) {
        const adminUser = { 
            id: 0,
            email: 'admin@system.com', 
            name: 'مدیر سیستم', 
            role: 'admin',
            avatar: null
        };
        
        // ذخیره ادمین در session
        setCurrentUser(adminUser);
        // انتقال به صفحه ادمین
        window.location.href = 'admin/admin.html';
    } else {
        alert('رمز عبور ادمین اشتباه است!');
    }
}

// بررسی اگر کاربر قبلاً لاگین کرده، مستقیماً به صفحه مربوطه برود
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'admin/admin.html';
        } else if (currentUser.role === 'user') {
            window.location.href = 'user/user.html';
        }
    }
});