const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

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
    
    db.get(`SELECT * FROM users WHERE username = ?`, ['admin'], async (err, row) => {
      if (err) {
        console.error('Error querying user:', err);
        return;
      }
      if (!row) {
        try {
          // hash default password
          const hashedPassword = await bcrypt.hash('senhaqtuvaiusar', 10);
          
          db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['admin', hashedPassword], (err) => {
            if (err) {
              console.error('Error inserting user:', err);
            } else {
              console.log('Usuario base inserido');
            }
            db.close();
          });
        } catch (err) {
          console.error('Erro encryptando a senha:', err);
          db.close();
        }
      } else {
        console.log('Usuario ja existe');
        db.close();
      }
    });
  });
});
