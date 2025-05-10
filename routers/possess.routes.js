const express = require('express');
const router = express.Router();
const possessController = require('../controllers/possess.controller');
const accessManager = require('../middleware/acessManager');

router.use(accessManager.RouterAccess);

// Get all game users
router.get('/', possessController.getAllGameUsers);

// Get users by game ID
router.get('/game/:id', possessController.getUsersByGameId);

// Create a new game user relationship
router.post('/', possessController.createGameUser);

// Delete a game user relationship
router.delete('/', possessController.deleteGameUser);

router.post('/:id/swipe', possessController.swipeGame);

module.exports = router;
