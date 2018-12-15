const config = require('./config.json');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

const shortid = require('shortid');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/hello', function(req, res, next) {
  res.send('world');
});

// Retrieves and redirects to the origin url.
app.get('/s/:code', function(req, res, next) {
  let code = req.params.code;
  let response = { error: true };
  let exists = db.get('urls').find({ id: code }).value();
  if(!!exists) {
      if(exists.secure)
          res.redirect('https://' + exists.url);
      else
          res.redirect('http://' + exists.url);
  } else {
      res.json(response);
  }
});

// Create short url for the origin url.
app.post('/c/:secure/:url', function(req, res, next) {
    let secure = !!JSON.parse(String(req.params.secure).toLowerCase());
  let url = req.params.url;
  let response = { error: true };
  let exists = db.get('urls').find({ secure: secure, url: url }).value();
  if(!!exists) {} else {
    response.error = false;
    let id = shortid.generate();
    db.get('urls').push({ id: id , secure: secure, url: url }).write();
    response.id = id;
    response.secure = secure;
    response.url = url;
  }
  res.json(response);
});

app.listen(config.port, () => console.log('Server started on port ' + config.port + '.'));