require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./backend/db');
const publicRoutes = require('./backend/routes/public');
const authRoutes = require('./backend/routes/auth');
const adminRoutes = require('./backend/routes/admin');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit:'1mb' }));
app.use(express.urlencoded({ extended:true }));

app.get('/api/health', async (req,res)=>{
  try { await pool.query('SELECT 1'); res.json({success:true,status:'ok',database:'connected'}); }
  catch { res.status(503).json({success:false,status:'error',database:'unavailable'}); }
});
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(path.join(__dirname,'backend/public')));
app.get('/admin', (req,res)=>res.sendFile(path.join(__dirname,'backend/public/admin/index.html')));
app.use((req,res,next)=>{
  if(req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname,'backend/public/scho.html'));
});

app.use((err,req,res,next)=>{
  console.error(err);
  if(err.code === 'ER_DUP_ENTRY') return res.status(409).json({success:false,message:'A record with that unique value already exists.'});
  res.status(500).json({success:false,message:'Internal server error.'});
});

app.listen(PORT,()=>console.log(`Excellence Academy server running at http://localhost:${PORT}`));
