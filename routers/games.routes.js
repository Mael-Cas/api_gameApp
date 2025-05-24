/**
 * Routeur des jeux
 * Définit les routes pour la gestion des jeux (CRUD, recherche, swipe, etc.)
 * Utilise le contrôleur games.controller et le middleware d'accès
 */
const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');
const accessManager = require('../middleware/acessManager');
const db = require('../db');

/**
 * Récupère tous les jeux (pagination possible)
 */
router.get('/', gamesController.getAllGames);

/**
 * Recherche des jeux par nom
 */
router.get('/search', gamesController.searchGamesByName);

/**
 * Filtre les jeux selon plusieurs critères (route publique)
 */
router.post('/filter', gamesController.filterGames);

/**
 * Récupère un jeu par son ID
 */
router.get('/:id', gamesController.getGameById);

/**
 * Récupère 10 jeux aléatoires pour le swipe (filtrés par nombre de joueurs)
 * Protégé par JWT
 */
router.get('/random/swipe', accessManager.RouterAccess, async (req, res) => {
    try {
        const playerCount = parseInt(req.query.playerCount) || 2;
        
        // Récupérer 10 jeux aléatoires qui correspondent au nombre de joueurs
        const [games] = await db.query(`
            SELECT * FROM Games 
            WHERE minplayers <= ? AND maxplayers >= ?
            ORDER BY RAND()
            LIMIT 10
        `, [playerCount, playerCount]);

        res.json(games);
    } catch (error) {
        // Log d'erreur critique
        console.error('[ERROR] Erreur lors de la récupération des jeux aléatoires:', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

/**
 * Récupère des jeux aléatoires et crée les entrées de possession pour l'utilisateur
 * Protégé par JWT
 */
router.get('/random/:userId', accessManager.RouterAccess, gamesController.getRandomGamesAndPossess);

/**
 * Crée un nouveau jeu (admin uniquement)
 */
router.post('/', accessManager.RouterAccess, accessManager.authorizeRole("admin"), gamesController.createGame);

/**
 * Met à jour un jeu (admin uniquement)
 */
router.put('/:id', accessManager.RouterAccess, accessManager.authorizeRole("admin"), gamesController.updateGame);

/**
 * Supprime un jeu (admin uniquement)
 */
router.delete('/:id', accessManager.RouterAccess, accessManager.authorizeRole("admin"), gamesController.deleteGame);

module.exports = router;
