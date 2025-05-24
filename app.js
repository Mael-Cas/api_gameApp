/**
 * Fichier principal de l'application Express
 * Configure les middlewares, les routes et démarre le serveur
 */
const express = require("express");
const cors = require("cors")

// const generics = require('./routers/generitics'); // SUPPRIMÉ
const games = require('./routers/games.routes');
const users = require('./routers/users.routes');
const possess = require("./routers/possess.routes");
const db = require('./db'); // Import de la connexion à la BDD

// Import du middleware d'authentification
const accessManager = require('./middleware/acessManager');

const app = express();
const PORT = 3000;

// Middlewares globaux
app.use(express.json());
app.use(cors());

/**
 * Route de test pour vérifier que le serveur fonctionne
 */
app.get('/', (req, res) => {
  res.send('Serveur Express + MySQL opérationnel');
});

// Créer un routeur pour /api
const apiRouter = express.Router();

// Appliquer le middleware d'authentification sur toutes les routes /api
apiRouter.use(accessManager.RouterAccess);

// Enregistrer les routes spécifiques sur le routeur /api
apiRouter.use('/possess', possess);
apiRouter.use('/Games', games);
apiRouter.use('/Users', users);

// Enregistrer le routeur générique sur /api
// apiRouter.use('/', generics); // SUPPRIMÉ

// Enregistrer le routeur /api sur l'application
app.use('/api', apiRouter);

/**
 * Middleware de gestion des erreurs 404
 */
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

/**
 * Middleware de gestion des erreurs serveur
 */
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Erreur serveur interne' });
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
  console.log(`[STATUS] Serveur démarré sur le port ${PORT}`);
});
