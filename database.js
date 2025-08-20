const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./myapp.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    
    db.get(`SELECT * FROM users WHERE username = ?`, ['user'], (err, row) => {
      if (err) {
        console.error('Error querying user:', err);
        return;
      }
      if (!row) {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['user', 'pass'], (err) => {
          if (err) {
            console.error('Error inserting user:', err);
          } else {
            console.log('Inserted default user');
          }
          db.close();
        });
      } else {
        console.log('User already exists');
        db.close();
      }
    });
  });
});
