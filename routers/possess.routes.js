const express = require('express');
const router = express.Router();
const possessController = require('../controllers/possess.controller');

// Get all game users
router.get('/', possessController.getAllGameUsers);

// Get users by game ID
router.get('/game/:id', possessController.getUsersByGameId);

// Create a new game user relationship
router.post('/', possessController.createGameUser);

// Delete a game user relationship
router.delete('/', possessController.deleteGameUser);

module.exports = router;
