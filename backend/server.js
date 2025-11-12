// کل فایل رو با این کد جایگزین کن
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS کامل برای همه دامنه‌ها
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false
}));

app.use(express.json());

const db = new sqlite3.Database('./database.db');

// ایجاد جداول
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        admin_email TEXT,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS gifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true
    )`);

    // کاربران پیش‌فرض
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('admin@iho.com', 'admin123', 'مدیر سیستم', 'admin', 1000000)`);
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('akhodabakhshiiho@gmail.com', '1234', 'امین خدابخشی', 'user', 1000)`);
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('a.khazael.iho@gmail.com', '1234', 'علی خزاعی', 'user', 1000)`);
    db.run(`INSERT OR IGNORE INTO users (email, password, name, role, balance) 
            VALUES ('b.bakhshayesh.iho@gmail.com', '1234', 'بابک بخشایش', 'user', 1000)`);

    // هدایای پیش‌فرض
    db.run(`INSERT OR IGNORE INTO gifts (name, price, description) 
            VALUES ('سینما - استخر - کافی‌شاپ', 250000, 'هدیه تفریحی')`);
    db.run(`INSERT OR IGNORE INTO gifts (name, price, description) 
            VALUES ('ایزنک و پینت بال', 550000, 'مجموعه تفریحی')`);
});

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'IHO Wallet API Server',
        version: '1.0',
        endpoints: ['/api/health', '/api/login', '/api/users', '/api/transactions', '/api/gifts']
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'سیستم کیف پول IHO فعال است',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/users', (req, res) => {
    db.all(`SELECT id, email, name, role, balance FROM users`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/users/:email', (req, res) => {
    const email = req.params.email;
    db.get(`SELECT id, email, name, role, balance FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'کاربر یافت نشد' });
        res.json(row);
    });
});

app.get('/api/transactions/:email', (req, res) => {
    const email = req.params.email;
    db.all(`SELECT * FROM transactions WHERE user_email = ? ORDER BY created_at DESC`, [email], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/transactions', (req, res) => {
    const { user_email, amount, type, description } = req.body;
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        db.run(`INSERT INTO transactions (user_email, amount, type, description) VALUES (?, ?, ?, ?)`, 
        [user_email, amount, type, description], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
            
            db.run(`UPDATE users SET balance = balance + ? WHERE email = ?`, [amount, user_email], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
                
                db.run('COMMIT');
                res.json({ id: this.lastID, message: 'تراکنش ثبت شد' });
            });
        });
    });
});

app.get('/api/gifts', (req, res) => {
    db.all(`SELECT * FROM gifts WHERE is_active = true`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT id, email, name, role, balance FROM users WHERE email = ? AND password = ?`, 
    [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
        
        res.json({ 
            success: true,
            user: row
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 سرور IHO Wallet اجرا شد روی پورت ${PORT}`);
});
