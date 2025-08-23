const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./myapp.db');

db.serialize(() => {
  db.all(`SELECT username, password FROM users`, (err, rows) => {
    if (err) {
      console.error('Erro na leitura:', err);
      return;
    }

    console.log("Usuarios no banco:");
    rows.forEach(row => {
      console.log(`- ${row.username}: ${row.password}`);
    });
  });
});

db.close();
