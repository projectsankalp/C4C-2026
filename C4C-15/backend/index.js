require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const patientsRouter = require('./routes/patients');
const visitsRouter = require('./routes/visits');
const screeningsRouter = require('./routes/screenings');
const { ensureMobileSchema } = require('./schema');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.use('/auth', authRouter);
app.use('/stats', statsRouter);
app.use('/patients', patientsRouter);
app.use('/visits', visitsRouter);
app.use('/screenings', screeningsRouter);

app.get('/', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;

(async () => {
  await ensureMobileSchema();

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
})().catch((err) => {
  console.error('Failed to initialize mobile schema', err);
  process.exit(1);
});
