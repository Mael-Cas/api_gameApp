const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');
const accessManager = require('../middleware/acessManager');



// Get all games
router.get('/',gamesController.getAllGames);

// Get a single game by ID
router.get('/:id', gamesController.getGameById);

// Get a game by Name
router.get('/:name', gamesController.searchGamesByName);

// Create a new game
router.post('/', accessManager.RouterAccess, accessManager.authorizeRole("admin"),gamesController.createGame);

// Update a game
router.put('/:id', accessManager.RouterAccess, accessManager.authorizeRole("admin"),gamesController.updateGame);

// Delete a game
router.delete('/:id', accessManager.RouterAccess, accessManager.authorizeRole("admin"),gamesController.deleteGame);

// Get random games and create possess entries
router.get('/random/:userId',accessManager.RouterAccess ,gamesController.getRandomGamesAndPossess);

// Add game to user favorite
router.post('/favorite', accessManager.RouterAccess, gamesController.favoriteGame)

// Get all favorite game of a user
router.get('/favorite', accessManager.RouterAccess, gamesController.getFavoriteGame)

module.exports = router;
