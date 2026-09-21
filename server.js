const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Simulasi (In-Memory)
let users = [
    { id: '08123456789', name: 'Wani User', pin: '123456', balance: 5000000 },
    { id: '08987654321', name: 'Budi Santoso', pin: '654321', balance: 2500000 }
];

let transactions = [
    { id: 'TX-1001', sender: '08123456789', recipient: 'Bank BCA (883012389)', amount: 250000, type: 'Transfer Bank', date: new Date().toLocaleString('id-ID') }
];

// Routing Halaman
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));

// --- API AUTHENTICATION & REGISTRASI ---

app.post('/api/register', (req, res) => {
    const { name, phone, pin } = req.body;
    if (users.find(u => u.id === phone)) {
        return res.status(400).json({ success: false, message: 'Nomor HP sudah terdaftar!' });
    }
    const newUser = { id: phone, name, pin, balance: 100000 }; // Bonus pendaftaran
    users.push(newUser);
    res.json({ success: true, message: 'Pendaftaran berhasil! Silakan login.' });
});

app.post('/api/login', (req, res) => {
    const { role, username, pin } = req.body;
    
    if (role === 'admin') {
        if (username === 'admin' && pin === 'admin123') {
            return res.json({ success: true, role: 'admin' });
        }
        return res.status(401).json({ success: false, message: 'Username/Password Admin salah! (Gunakan: admin / admin123)' });
    } else {
        const user = users.find(u => u.id === username && u.pin === pin);
        if (user) {
            return res.json({ success: true, role: 'user', user });
        }
        return res.status(401).json({ success: false, message: 'Nomor HP atau PIN salah!' });
    }
});

// --- API USER & TRANSAKSI ---

app.get('/api/user/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    
    // Ambil riwayat terkait user ini
    const userTx = transactions.filter(t => t.sender === user.id || t.recipient === user.id);
    res.json({ user, transactions: userTx });
});

app.post('/api/transfer', (req, res) => {
    const { senderId, targetType, targetNumber, amount } = req.body;
    const nominal = parseInt(amount);

    const sender = users.find(u => u.id === senderId);
    if (!sender) return res.status(404).json({ message: 'Pengirim tidak ditemukan' });
    if (sender.balance < nominal) return res.status(400).json({ message: 'Saldo tidak mencukupi!' });

    // Cek jika transfer sesama akun Kahut
    if (targetType === 'KAHUT') {
        const recipient = users.find(u => u.id === targetNumber);
        if (!recipient) return res.status(404).json({ message: 'Nomor akun tujuan tidak ditemukan!' });
        
        sender.balance -= nominal;
        recipient.balance += nominal;

        transactions.unshift({
            id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
            sender: sender.id,
            recipient: recipient.id,
            amount: nominal,
            type: 'Transfer Sesama Kahut',
            date: new Date().toLocaleString('id-ID')
        });

        return res.json({ success: true, message: `Transfer Rp ${nominal.toLocaleString()} ke ${recipient.name} berhasil!` });
    } else {
        // Transfer ke Bank Lain
        sender.balance -= nominal;
        transactions.unshift({
            id: 'TX-' + Math.floor(1000 + Math.random() * 9000),
            sender: sender.id,
            recipient: `${targetType} (${targetNumber})`,
            amount: nominal,
            type: 'Transfer Bank',
            date: new Date().toLocaleString('id-ID')
        });

        return res.json({ success: true, message: `Transfer Rp ${nominal.toLocaleString()} ke ${targetType} berhasil!` });
    }
});

// --- API ADMIN ---

app.get('/api/admin/data', (req, res) => {
    res.json({ users, transactions });
});

app.post('/api/admin/adjust-balance', (req, res) => {
    const { userId, type, amount } = req.body;
    const user = users.find(u => u.id === userId);
    const nominal = parseInt(amount);

    if (!user) return res.status(404).json({ message: 'Member tidak ditemukan' });

    if (type === 'ADD') {
        user.balance += nominal;
    } else if (type === 'SUBTRACT') {
        if (user.balance < nominal) return res.status(400).json({ message: 'Saldo member kurang untuk dikurangi!' });
        user.balance -= nominal;
    }

    transactions.unshift({
        id: 'ADM-' + Math.floor(1000 + Math.random() * 9000),
        sender: 'SYSTEM ADMIN',
        recipient: user.id,
        amount: nominal,
        type: type === 'ADD' ? 'Penambahan Saldo oleh Admin' : 'Pengurangan Saldo oleh Admin',
        date: new Date().toLocaleString('id-ID')
    });

    res.json({ success: true, message: 'Saldo member berhasil diperbarui!' });
});

app.listen(PORT, () => console.log(`Server Kahut Bank berjalan di port ${PORT}`));
