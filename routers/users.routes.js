const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const accessManager = require('../middleware/acessManager');

// Get all users
router.get('/', accessManager.RouterAccess, accessManager.authorizeRole("admin"),usersController.getAllUsers);

// Get a single user by ID
router.get('/:id',accessManager.RouterAccess ,usersController.getUserById);

// Create a new user
router.post('/', accessManager.RouterAccess, usersController.createUser);

// Login route
router.post('/login',usersController.login);

// Update a user
router.put('/:id',accessManager.RouterAccess ,usersController.updateUser);

// Delete a user
router.delete('/:id',accessManager.RouterAccess ,usersController.deleteUser);

module.exports = router;
