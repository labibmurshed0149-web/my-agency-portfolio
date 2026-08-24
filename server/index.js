import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import { sendContactEmail } from './mailer.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

const db = await initDb();

app.get('/api/health', (req, res) => res.json({ ok: true }));

// trigger a test email to verify SMTP settings
app.get('/api/test-email', async (req, res) => {
  try{
    const info = await sendContactEmail({ name: 'AXIORA Test', email: process.env.SMTP_USER || 'no-reply', message: 'This is a test email to verify SMTP settings.' });
    return res.json({ ok: true, info });
  }catch(err){
    console.error('Test email failed', err && err.message);
    return res.status(500).json({ ok: false, error: String(err && err.message) });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  try {
    await db.run('INSERT INTO contacts (name, email, message) VALUES (?,?,?)', [name, email, message]);
    // attempt to send notification email and return status to client (helps debugging)
    try{
      const info = await sendContactEmail({ name, email, message });
      return res.json({ ok: true, emailSent: true, info });
    }catch(err){
      console.error('Failed to send notification email', err && err.message);
      return res.status(502).json({ ok: true, emailSent: false, error: String(err && err.message) });
    }
  } catch (err) {
    console.error('DB error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
