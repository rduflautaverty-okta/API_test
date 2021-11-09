const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const helper = require('./js/helper.js');

const app = express();
const port = process.env.PORT || 28550;


// Provide files on demand
app.get('/', (req, res) => provide(res, 'index.html'));
app.get('/js/storage.js', (req, res) => provide(res, 'js/storage.js'));
app.get('/js/environment.js', (req, res) => provide(res, 'js/environment.js'));
app.get('/js/api.js', (req, res) => provide(res, 'js/api.js'));
app.get('/js/worker.js', (req, res) => provide(res, 'js/worker.js'));
app.get('favicon.ico', (req, res) => provide(res, 'img/okta.ico'));

function provide(res, file) {
  res.sendFile(path.join(__dirname, file));
}

// Proxy API calls
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.all('/api', helper.verifytoken, helper.checkMessage);

// Listen for requests
app.listen(port, () => console.log(`Server app listening at http://localhost:${port}`));
