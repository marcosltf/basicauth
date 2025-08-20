const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: '98c9cc024f2fce57f7e5c9257f690ef410555e11d783647ad754c59cf7ccced0',
  resave: false,
  saveUninitialized: false,
}));

// SQLite database connection
const db = new sqlite3.Database('./myapp.db');

// Serve static files except index.html by default
app.use(express.static(path.join(__dirname), { index: false }));

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect('/index.html');
  } else {
    res.redirect('/login.html');
  }
});

app.get('/index.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Login POST handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      console.error(err);
      res.send('Internal server error');
      return;
    }

    if (row) {
      req.session.authenticated = true;
      res.redirect('/index.html');
    } else {
      res.send('Invalid credentials. <a href="/login.html">Try again</a>');
    }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
