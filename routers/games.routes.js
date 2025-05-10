const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');
const accessManager = require('../middleware/acessManager');

router.use(accessManager.RouterAccess);

// Get all games
router.get('/',gamesController.getAllGames);

// Get a single game by ID
router.get('/:id', gamesController.getGameById);

// Get a game by Name
router.get('/:name', gamesController.searchGamesByName);

// Create a new game
router.post('/', gamesController.createGame);

// Update a game
router.put('/:id', gamesController.updateGame);

// Delete a game
router.delete('/:id', gamesController.deleteGame);

// Get random games and create possess entries
router.get('/random/:userId', gamesController.getRandomGamesAndPossess);

module.exports = router;
