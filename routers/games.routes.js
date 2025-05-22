const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');
const accessManager = require('../middleware/acessManager');
const db = require('../db');

// Get all games
router.get('/', gamesController.getAllGames);

// Get a game by Name
router.get('/search/:name', gamesController.searchGamesByName);

// Get a single game by ID
router.get('/:id', gamesController.getGameById);

// Get random games for swipe
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
        console.error('Erreur lors de la récupération des jeux aléatoires:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Get random games and create possess entries
router.get('/random/:userId', accessManager.RouterAccess, gamesController.getRandomGamesAndPossess);

// Get all favorite game of a user
router.get('/favorite', accessManager.RouterAccess, gamesController.getFavoriteGame);

// Add game to user favorite
router.post('/favorite', accessManager.RouterAccess, gamesController.favoriteGame);

// Create a new game
router.post('/', accessManager.RouterAccess, accessManager.authorizeRole("admin"), gamesController.createGame);

// Update a game
router.put('/:id', accessManager.RouterAccess, accessManager.authorizeRole("admin"), gamesController.updateGame);

// Delete a game
router.delete('/:id', accessManager.RouterAccess, accessManager.authorizeRole("admin"), gamesController.deleteGame);

module.exports = router;
