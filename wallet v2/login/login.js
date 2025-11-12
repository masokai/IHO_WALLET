// توابع مخصوص صفحه لاگین - نسخه نهایی
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('لطفاً ایمیل و رمز عبور را وارد کنید!');
        return;
    }
    
    // نمایش loading
    const loginBtn = document.querySelector('.btn-primary');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال لاگین...';
    loginBtn.disabled = true;
    
    console.log('🔐 در حال لاگین با:', email);
    
    // استفاده از Promise برای مدیریت بهتر
    api.login(email, password)
        .then(result => {
            console.log('✅ لاگین موفق:', result);
            
            if (result.success) {
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // انتقال به صفحه کاربر
                setTimeout(() => {
                    window.location.href = 'user/user.html';
                }, 500);
            } else {
                throw new Error('لاگین ناموفق');
            }
        })
        .catch(error => {
            console.error('❌ خطای لاگین:', error);
            
            // بررسی نوع خطا
            let errorMessage = 'خطا در ارتباط با سرور';
            if (error.message.includes('401')) {
                errorMessage = 'ایمیل یا رمز عبور اشتباه است';
            } else if (error.message.includes('Network')) {
                errorMessage = 'خطا در اتصال به سرور. لطفاً اینترنت را بررسی کنید';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'سرور در دسترس نیست. لطفاً稍后再试';
            }
            
            alert(errorMessage);
        })
        .finally(() => {
            // بازگرداندن دکمه به حالت اول
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        });
}

function adminLogin() {
    const password = document.getElementById('password').value;
    
    if (!password) {
        alert('لطفاً رمز عبور ادمین را وارد کنید!');
        return;
    }
    
    if (password === 'admin123') {
        // نمایش loading
        const adminBtn = document.querySelector('.btn-secondary');
        const originalText = adminBtn.innerHTML;
        adminBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ورود...';
        adminBtn.disabled = true;
        
        // اول سعی کن با سرور لاگین کنی
        api.login('admin@iho.com', 'admin123')
            .then(result => {
                if (result.success) {
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    window.location.href = 'admin/admin.html';
                }
            })
            .catch(error => {
                console.warn('⚠️ سرور در دسترس نیست، استفاده از حالت آفلاین:', error);
                // حالت fallback - کاربر آفلاین
                const adminUser = { 
                    email: 'admin@iho.com', 
                    name: 'مدیر سیستم', 
                    role: 'admin',
                    balance: 1000000
                };
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                window.location.href = 'admin/admin.html';
            })
            .finally(() => {
                adminBtn.innerHTML = originalText;
                adminBtn.disabled = false;
            });
    } else {
        alert('رمز عبور ادمین اشتباه است!');
    }
}

// وقتی صفحه loaded شد
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 صفحه لاگین loaded');
    
    // تست اتصال به سرور
    testConnection();
    
    // بررسی اگر کاربر قبلاً لاگین کرده
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        console.log('👤 کاربر از قبل لاگین کرده:', currentUser);
        if (currentUser.role === 'admin') {
            setTimeout(() => {
                window.location.href = 'admin/admin.html';
            }, 1000);
        } else if (currentUser.role === 'user') {
            setTimeout(() => {
                window.location.href = 'user/user.html';
            }, 1000);
        }
    }
    
    // اضافه کردن event listener برای کلید Enter
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});

// تست اتصال به سرور
async function testConnection() {
    try {
        console.log('🔍 تست اتصال به سرور...');
        const result = await api.health();
        console.log('✅ اتصال به سرور برقرار است:', result);
        document.body.classList.add('server-connected');
    } catch (error) {
        console.warn('⚠️ اتصال به سرور برقرار نیست:', error.message);
        document.body.classList.add('server-offline');
        
        // نمایش اخطار به کاربر
        const demoAccounts = document.querySelector('.demo-accounts');
        if (demoAccounts) {
            demoAccounts.innerHTML += `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <strong>⚠️ توجه:</strong> سرور در دسترس نیست. سیستم در حالت دمو کار می‌کند.
                </div>
            `;
        }
    }
}
