const express = require('express'), path = require('path');
const app = express();
app.use(express.json({ limit: '30mb' }));
app.use('/api', require('./routes/api'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html'))); // SPA fallback
app.listen(process.env.PORT || 3000, () => console.log(`Running on http://localhost:${process.env.PORT || 3000}`));