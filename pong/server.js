// require('dotenv').config({ path: '../.env' });
const express = require('express');
const path = require('path');


const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, '/')));

app.get('/api/config', (req, res) => {
  res.json({
      IP_LOCAL: process.env.IP_LOCAL,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on https://0.0.0.0:${PORT}`);
});
