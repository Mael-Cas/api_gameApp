const express = require('express');
const router = express.Router();
const possessController = require('../controllers/possess.controller');
const accessManager = require('../middleware/acessManager');

router.use(accessManager.RouterAccess);

// Get all game users
router.get('/', possessController.getAllGameUsers);

// Get users by game ID
router.get('/game/:id', possessController.getUsersByGameId);

// Get user favorites
router.get('/favorites', possessController.getUserFavorites);

// Get user unfavorites
router.get('/unfavorites', possessController.getUserUnfavorites);

// Create a new game user relationship
router.post('/', possessController.createGameUser);

// Update game status (favorite/unfavorite)
router.post('/:id', possessController.updateGameStatus);

// Delete a game user relationship
router.delete('/:id', possessController.deleteGameUser);

// Swipe on a game
router.post('/:id/swipe', possessController.swipeGame);

// Get recommendations
router.get('/recommend', possessController.recommend_game);

// Get personalized recommendations
router.get('/recommendations', possessController.getPersonalizedRecommendations);

module.exports = router;
