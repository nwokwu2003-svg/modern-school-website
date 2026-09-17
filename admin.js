const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/dashboard', async (req,res,next) => {
  try {
    const [[inquiries]] = await pool.query("SELECT COUNT(*) AS total, SUM(status='new') AS new_count FROM inquiries");
    const [[messages]] = await pool.query("SELECT COUNT(*) AS total, SUM(status='new') AS new_count FROM contact_messages");
    const [[students]] = await pool.query("SELECT COUNT(*) AS total FROM students WHERE status='active'");
    res.json({ success:true, data:{ inquiries, messages, students } });
  } catch(err){ next(err); }
});

router.get('/inquiries', async (req,res,next)=>{
  try {
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json({success:true,data:rows});
  } catch(err){next(err);}
});

router.patch('/inquiries/:id/status', async (req,res,next)=>{
  try {
    const status = String(req.body.status || '');
    if (!['new','contacted','closed'].includes(status)) return res.status(400).json({success:false,message:'Invalid status.'});
    await pool.execute('UPDATE inquiries SET status=? WHERE id=?',[status,req.params.id]);
    res.json({success:true,message:'Inquiry updated.'});
  } catch(err){next(err);}
});

router.get('/messages', async (req,res,next)=>{
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({success:true,data:rows});
  } catch(err){next(err);}
});

router.patch('/messages/:id/status', async (req,res,next)=>{
  try {
    const status = String(req.body.status || '');
    if (!['new','read','replied','closed'].includes(status)) return res.status(400).json({success:false,message:'Invalid status.'});
    await pool.execute('UPDATE contact_messages SET status=? WHERE id=?',[status,req.params.id]);
    res.json({success:true,message:'Message updated.'});
  } catch(err){next(err);}
});

router.get('/students', async (req,res,next)=>{
  try { const [rows]=await pool.query('SELECT * FROM students ORDER BY created_at DESC'); res.json({success:true,data:rows}); }
  catch(err){next(err);}
});

router.post('/students', async (req,res,next)=>{
  try {
    const { admission_no, first_name, last_name, email, phone, grade, date_of_birth, guardian_name, guardian_phone } = req.body;
    if(!admission_no || !first_name || !last_name || !grade) return res.status(400).json({success:false,message:'Admission number, names and grade are required.'});
    const [result]=await pool.execute(
      `INSERT INTO students (admission_no,first_name,last_name,email,phone,grade,date_of_birth,guardian_name,guardian_phone)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [admission_no,first_name,last_name,email||null,phone||null,grade,date_of_birth||null,guardian_name||null,guardian_phone||null]
    );
    res.status(201).json({success:true,id:result.insertId});
  } catch(err){next(err);}
});

router.patch('/stats', async (req,res,next)=>{
  try {
    const students=Number(req.body.students), success_rate=Number(req.body.success_rate), faculty=Number(req.body.faculty), years_excellence=Number(req.body.years_excellence);
    if([students,success_rate,faculty,years_excellence].some(Number.isNaN)) return res.status(400).json({success:false,message:'All statistics must be numbers.'});
    await pool.execute('UPDATE site_stats SET students=?,success_rate=?,faculty=?,years_excellence=? WHERE id=1',[students,success_rate,faculty,years_excellence]);
    res.json({success:true,message:'Statistics updated.'});
  } catch(err){next(err);}
});

module.exports=router;
