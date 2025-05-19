const express = require("express");
const cors = require("cors")

const generics = require('./routers/generitics');
const games = require('./routers/games.routes');
const users = require('./routers/users.routes');
const favorites = require('./routers/favorites.routes');
const db = require('./db'); // Import de la connexion à la BDD

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Route de test
app.get('/', (req, res) => {
  res.send('Serveur Express + MySQL opérationnel');
});

app.use('/api/Games', games);
app.use('/api/Users', users);
app.use('/api/favorites', favorites);
app.use('/api', generics);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
