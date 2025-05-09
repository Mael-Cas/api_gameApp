const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

// Get all users
router.get('/', usersController.getAllUsers);

// Get a single user by ID
router.get('/:id', usersController.getUserById);

// Create a new user
router.post('/', usersController.createUser);

// Login route
router.post('/login', usersController.login);

// Update a user
router.put('/:id', usersController.updateUser);

// Delete a user
router.delete('/:id', usersController.deleteUser);

module.exports = router;
