# AXIORA Server

This folder contains a minimal Express API used for the contact form.

Quick start:

```bash
cd server
npm install
npm run dev
```

The server exposes:
- `POST /api/contact` — accepts JSON { name, email, message } and saves into `data.db`.
- `GET /api/health` — health check.

API responses for `POST /api/contact`:
- Success with email: `{ ok: true, emailSent: true, info: {...} }`
- Saved but email failed: `{ ok: true, emailSent: false, error: 'error message' }` (server logs full error)
- DB or input error: appropriate 4xx/5xx responses

Email notifications
 - The server can send email notifications when a contact is received. Configure SMTP credentials in a `.env` file (copy `.env.example`):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO=axioralab335@gmail.com
```

 - For Gmail: enable 2-step verification and create an App Password, then use that as `SMTP_PASS`.
 - The server will attempt to send a notification after saving the contact — failures are logged but won't prevent the API from responding.
