const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

// Get all games
router.get('/', gamesController.getAllGames);

// Get a single game by ID
router.get('/:id', gamesController.getGameById);

// Create a new game
router.post('/', gamesController.createGame);

// Update a game
router.put('/:id', gamesController.updateGame);

// Delete a game
router.delete('/:id', gamesController.deleteGame);

// Get random games and create possess entries
router.get('/random/:userId', gamesController.getRandomGamesAndPossess);

module.exports = router;
