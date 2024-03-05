// staticFolder.js
const express = require('express');
const path = require('path');

const staticFolder = express.Router();

staticFolder.use(express.static('./web'));
staticFolder.use(express.static('./web/assets'));

// Handle client route
staticFolder.get('/client', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'web', 'app.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = staticFolder;