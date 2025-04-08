require('dotenv').config();
const mysql = require('mysql2');
const express = require("express");

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la BDD :', err.message);
        process.exit(1); // Arrêter si la connexion échoue
    }
    console.log('✅ Connecté à la base de données MySQL');
});

// Route de test
app.get('/', (req, res) => {
    res.send('Serveur Express + MySQL opérationnel');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});