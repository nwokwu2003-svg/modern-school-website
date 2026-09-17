require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

(async() => {
    try {
        const email = (process.env.ADMIN_EMAIL || 'nwokwu2003@gmail.com').toLowerCase();
        const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
        const name = process.env.ADMIN_NAME || 'School Administrator';
        const hash = await bcrypt.hash(password, 12);
        await pool.execute(
            `INSERT INTO admins (name,email,password_hash) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash)`, [name, email, hash]
        );
        console.log(`Admin ready: ${email}`);
        console.log('Change the default password before production use.');
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally { await pool.end(); }
})();