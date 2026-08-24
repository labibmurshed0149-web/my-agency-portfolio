import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM = process.env.FROM || SMTP_USER;

let transporter;

function createTransporter(){
  const opts = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
  };
  if (SMTP_USER && SMTP_PASS) opts.auth = { user: SMTP_USER, pass: SMTP_PASS };
  transporter = nodemailer.createTransport(opts);
}

createTransporter();

export async function sendContactEmail({ name, email, message }){
  if(!transporter) createTransporter();
  const to = process.env.CONTACT_TO || SMTP_USER;
  // If no recipient configured, in development log the message instead of throwing.
  if(!to){
    if(process.env.NODE_ENV === 'development'){
      console.warn('No recipient configured (CONTACT_TO or SMTP_USER) — running in development, logging email to console instead of sending.');
      const subject = `New contact from ${name} — ${email}`;
      const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const html = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`;
      console.log('\n--- Simulated outgoing email (development mode) ---');
      console.log('From:', FROM);
      console.log('To:', to || '(none configured)');
      console.log('Subject:', subject);
      console.log('Text:', text);
      console.log('HTML:', html);
      console.log('--- End simulated email ---\n');
      return { simulated: true };
    }
    throw new Error('No recipient configured (CONTACT_TO or SMTP_USER)');
  }

  // verify transporter connection first (helps surface auth/connect issues quickly)
  try{
    await transporter.verify();
  }catch(err){
    if(process.env.NODE_ENV === 'development'){
      console.warn('SMTP connection/credentials invalid — running in development, logging email to console instead of sending. Error:', err && err.message);
      const subject = `New contact from ${name} — ${email}`;
      const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const html = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`;
      console.log('\n--- Simulated outgoing email (development mode) ---');
      console.log('From:', FROM);
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Text:', text);
      console.log('HTML:', html);
      console.log('--- End simulated email ---\n');
      return { simulated: true };
    }
    throw new Error('SMTP connection/credentials invalid: ' + (err && err.message));
  }

  const subject = `New contact from ${name} — ${email}`;
  const text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const html = `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`;

  const info = await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text,
    html
  });
  return info;
}
