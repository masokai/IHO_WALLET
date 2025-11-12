const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// دیتابیس SQLite
const db = new sqlite3.Database('./database.db');

// ایجاد جداول
db.serialize(() => {
    // جدول کاربران
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        avatar TEXT,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // جدول تراکنش‌ها
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        admin_email TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_email) REFERENCES users(email)
    )`);

    // جدول هدایا
    db.run(`CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // کاربر ادمین پیش‌فرض
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('admin@iho.com', 'admin123', 'مدیر سیستم', 'admin', 1000000)`);

    // کاربران نمونه
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('akhodabakhshiiho@gmail.com', '1234', 'امین خدابخشی', 'user', 1000)`);
    
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('a.khazael.iho@gmail.com', '1234', 'علی خزاعی', 'user', 1000)`);
    
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('b.bakhshayesh.iho@gmail.com', '1234', 'بابک بخشایش', 'user', 1000)`);

    // هدایای نمونه
    db.run(`INSERT OR IGNORE INTO gifts (name, price, description) 
            VALUES ('سینما - استخر - کافی‌شاپ', 250000, 'هدیه تفریحی برای اوقات فراغت')`);
    
    db.run(`INSERT OR IGNORE INTO gifts (name, price, description) 
            VALUES ('ایزنک و پینت بال', 550000, 'مجموعه تفریحی و ورزشی')`);
    
    db.run(`INSERT OR IGNORE INTO gifts (name, price, description) 
            VALUES ('آرایشی و بهداشتی', 830000, 'محصولات آرایشی و مراقبتی')`);
});

// Routes

// سلامت سرویس
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'سیستم کیف پول IHO فعال است',
        timestamp: new Date().toISOString()
    });
});

// دریافت همه کاربران
app.get('/api/users', (req, res) => {
    db.all(`SELECT id, email, name, role, avatar, balance, created_at FROM users ORDER BY created_at DESC`, 
    (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// دریافت کاربر خاص
app.get('/api/users/:email', (req, res) => {
    const email = req.params.email;
    db.get(`SELECT id, email, name, role, avatar, balance FROM users WHERE email = ?`, 
    [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'کاربر یافت نشد' });
        res.json(row);
    });
});

// دریافت تراکنش‌های کاربر
app.get('/api/transactions/:email', (req, res) => {
    const email = req.params.email;
    db.all(`SELECT * FROM transactions WHERE user_email = ? ORDER BY created_at DESC`, 
    [email], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// دریافت همه تراکنش‌ها (برای ادمین)
app.get('/api/transactions', (req, res) => {
    db.all(`SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100`, 
    (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// افزودن تراکنش
app.post('/api/transactions', (req, res) => {
    const { user_email, amount, type, description, admin_email } = req.body;
    
    if (!user_email || amount === undefined || !type) {
        return res.status(400).json({ error: 'فیلدهای الزامی را پر کنید' });
    }

    // شروع تراکنش دیتابیس
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // افزودن تراکنش
        db.run(`INSERT INTO transactions (user_email, amount, type, description, admin_email) 
                VALUES (?, ?, ?, ?, ?)`, 
        [user_email, amount, type, description, admin_email || null], 
        function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            
            const transactionId = this.lastID;
            
            // به‌روزرسانی موجودی کاربر
            db.run(`UPDATE users SET balance = balance + ? WHERE email = ?`, 
            [amount, user_email], 
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                db.run('COMMIT');
                res.json({ 
                    id: transactionId, 
                    message: 'تراکنش با موفقیت ثبت شد'
                });
            });
        });
    });
});

// دریافت همه هدایا
app.get('/api/gifts', (req, res) => {
    db.all(`SELECT * FROM gifts WHERE is_active = true ORDER BY price ASC`, 
    (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// افزودن هدیه جدید
app.post('/api/gifts', (req, res) => {
    const { name, price, description, image_url } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'نام و قیمت هدیه الزامی است' });
    }
    
    db.run(`INSERT INTO gifts (name, price, description, image_url) 
            VALUES (?, ?, ?, ?)`, 
    [name, price, description, image_url || null], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'هدیه با موفقیت افزوده شد' });
    });
});

// خرید هدیه
app.post('/api/buy-gift', (req, res) => {
    const { user_email, gift_id } = req.body;
    
    if (!user_email || !gift_id) {
        return res.status(400).json({ error: 'ایمیل کاربر و شناسه هدیه الزامی است' });
    }
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // دریافت اطلاعات هدیه
        db.get(`SELECT * FROM gifts WHERE id = ? AND is_active = true`, [gift_id], (err, gift) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            
            if (!gift) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'هدیه یافت نشد' });
            }
            
            // بررسی موجودی کاربر
            db.get(`SELECT balance FROM users WHERE email = ?`, [user_email], (err, user) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                if (!user) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'کاربر یافت نشد' });
                }
                
                if (user.balance < gift.price) {
                    db.run('ROLLBACK');
                    return res.status(400).json({ error: 'موجودی کافی نیست' });
                }
                
                // ثبت تراکنش خرید
                db.run(`INSERT INTO transactions (user_email, amount, type, description) 
                        VALUES (?, ?, ?, ?)`, 
                [user_email, -gift.price, 'خرید هدیه', `خرید ${gift.name}`], 
                function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }
                    
                    // به‌روزرسانی موجودی
                    db.run(`UPDATE users SET balance = balance - ? WHERE email = ?`, 
                    [gift.price, user_email], 
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                        }
                        
                        db.run('COMMIT');
                        res.json({ 
                            success: true,
                            message: `هدیه "${gift.name}" با موفقیت خریداری شد`,
                            remainingBalance: user.balance - gift.price
                        });
                    });
                });
            });
        });
    });
});

// افزودن کاربر جدید
app.post('/api/users', (req, res) => {
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'ایمیل، رمز عبور و نام الزامی است' });
    }
    
    db.run(`INSERT INTO users (email, password, name, role) 
            VALUES (?, ?, ?, ?)`, 
    [email, password, name, role || 'user'], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'این ایمیل قبلاً ثبت شده است' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'کاربر با موفقیت افزوده شد' });
    });
});

// لاگین
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است' });
    }
    
    db.get(`SELECT id, email, name, role, avatar, balance FROM users WHERE email = ? AND password = ?`, 
    [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
        
        res.json({ 
            success: true,
            user: row
        });
    });
});

// مدیریت خطاهای ناشناخته
app.use((err, req, res, next) => {
    console.error('خطای سرور:', err);
    res.status(500).json({ error: 'خطای داخلی سرور' });
});

// مسیرهای نامعلوم
app.use('*', (req, res) => {
    res.status(404).json({ error: 'مسیر یافت نشد' });
});

app.listen(PORT, () => {
    console.log(`🚀 سرور IHO Wallet اجرا شد روی پورت ${PORT}`);
    console.log(`📊 سلامت سرویس: http://localhost:${PORT}/api/health`);
    console.log(`👤 حساب ادمین: admin@iho.com / admin123`);
    console.log(`👥 حساب کاربری: akhodabakhshiiho@gmail.com / 1234`);
});
