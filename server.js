const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/search', (req, res) => {
  const { query } = req.body;
  if (query === undefined) return res.status(400).json({ error: 'Query required' });
  if (query === '') return res.json({ results: [] });
  res.json({ results: [{ title: `Result for ${query}` }] });
});

app.listen(5001, () => console.log('API server running on port 5001'));