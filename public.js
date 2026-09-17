const express = require('express');
const pool = require('../db');
const router = express.Router();

const clean = (v) => typeof v === 'string' ? v.trim() : '';

router.post('/inquiries', async (req, res, next) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const phone = clean(req.body.phone);
    const grade = clean(req.body.grade);
    const message = clean(req.body.message);

    if (!name || !email || !phone || !grade) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and grade are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO inquiries (name,email,phone,grade,message) VALUES (?,?,?,?,?)',
      [name, email, phone, grade, message || null]
    );
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully.', id: result.insertId });
  } catch (err) { next(err); }
});

router.post('/contact', async (req, res, next) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const subject = clean(req.body.subject);
    const message = clean(req.body.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, subject and message are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO contact_messages (name,email,subject,message) VALUES (?,?,?,?)',
      [name, email, subject, message]
    );
    res.status(201).json({ success: true, message: 'Message sent successfully.', id: result.insertId });
  } catch (err) { next(err); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT students, success_rate, faculty, years_excellence FROM site_stats WHERE id=1 LIMIT 1');
    res.json({ success: true, data: rows[0] || null });
  } catch (err) { next(err); }
});

router.get('/programs', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id,title,description,icon FROM programs WHERE active=1 ORDER BY sort_order,id');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/gallery', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id,title,image_path,alt_text FROM gallery WHERE active=1 ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

module.exports = router;
