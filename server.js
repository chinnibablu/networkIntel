const express = require('express'), path = require('path'), crypto = require('crypto');
const db = require('./db'); // loads .env locally; on Render the variables come from the dashboard
const app = express();

// Password-protect the whole site (your connections are personal data). Set APP_PASSWORD to enable.
const { APP_USER = 'admin', APP_PASSWORD } = process.env;
const hash = s => crypto.createHash('sha256').update(String(s)).digest();
if (APP_PASSWORD) {
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next();
    const raw = Buffer.from((req.headers.authorization || '').split(' ')[1] || '', 'base64').toString(), i = raw.indexOf(':');
    const ok = i > -1 && crypto.timingSafeEqual(hash(raw.slice(0, i)), hash(APP_USER)) && crypto.timingSafeEqual(hash(raw.slice(i + 1)), hash(APP_PASSWORD));
    if (ok) return next();
    res.set('WWW-Authenticate', 'Basic realm="Networking Intelligence"').status(401).send('Authentication required');
  });
} else console.warn('WARNING: APP_PASSWORD is not set. Anyone with the URL can see and replace your data.');

app.use(express.json({ limit: '30mb' }));
app.use('/api', require('./routes/api'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));