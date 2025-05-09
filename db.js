require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Vérification de la connexion au démarrage
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connecté à la base de données MySQL');
    connection.release(); // très important pour libérer le slot dans le pool
  } catch (err) {
    console.error('❌ Erreur de connexion à la BDD :', err.message);
    process.exit(1);
  }
})();

module.exports = db;
