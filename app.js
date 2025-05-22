const express = require("express");
const cors = require("cors")

const generics = require('./routers/generitics');
const games = require('./routers/games.routes');
const users = require('./routers/users.routes');
const possess = require("./routers/possess.routes");
const db = require('./db'); // Import de la connexion à la BDD

const app = express();
const PORT = 3000;

// Middlewares globaux
app.use(express.json());
app.use(cors());

// Route de test
app.get('/', (req, res) => {
  res.send('Serveur Express + MySQL opérationnel');
});

// Créer un routeur pour /api
const apiRouter = express.Router();

// Enregistrer les routes spécifiques sur le routeur /api
apiRouter.use('/possess', possess);
apiRouter.use('/Games', games);
apiRouter.use('/Users', users);

// Enregistrer le routeur générique sur /api
apiRouter.use('/', generics);

// Enregistrer le routeur /api sur l'application
app.use('/api', apiRouter);

// Middleware de gestion des erreurs 404
app.use((req, res, next) => {
  console.log('Route non trouvée:', req.method, req.url);
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
