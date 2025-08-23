const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Persistent session store
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: '98c9cc024f2fce57f7e5c9257f690ef410555e11d783647ad754c59cf7ccced0', // replace in production
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

const db = new sqlite3.Database('./myapp.db');

// usar ejs com o express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// servir as imagens e css estaticos
app.use('/static', express.static(path.join(__dirname, 'static')));

// auth
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// rotas
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect('/index.html');
  } else {
    res.redirect('/login.html');
  }
});

// login
app.get('/login.html', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/index.html');
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

// usar o ejs em vez do html estatico
app.get('/index.html', isAuthenticated, (req, res) => {
  res.render('index', { username: req.session.username });
});

// Login POST
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
    if (err) {
      console.error(err);
      res.send('Internal server error');
      return;
    }

    if (row && await bcrypt.compare(password, row.password)) {
      req.session.authenticated = true;
      req.session.username = row.username; // save username in session
      res.redirect('/index.html');
    } else {
      res.send('Invalid credentials. <a href="/login.html">Try again</a>');
    }
  });
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
