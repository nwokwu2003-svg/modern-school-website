const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password are required.' });

    const [rows] = await pool.execute('SELECT id,name,email,password_hash FROM admins WHERE email=? LIMIT 1', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ success:false, message:'Invalid login details.' });
    }

    const token = jwt.sign({ id: rows[0].id, email: rows[0].email, name: rows[0].name }, process.env.JWT_SECRET, { expiresIn:'8h' });
    res.json({ success:true, token, admin:{ id:rows[0].id, name:rows[0].name, email:rows[0].email } });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req,res) => res.json({ success:true, admin:req.admin }));
module.exports = router;
