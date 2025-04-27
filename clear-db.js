const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./modlogs.db');

db.serialize(() => {
    db.run('DELETE FROM modlogs');
    console.log('All logs deleted!');
});

db.close();
