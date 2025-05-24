/**
 * Routeur des utilisateurs
 * Définit les routes pour la gestion des utilisateurs (CRUD, login, etc.)
 * Utilise le contrôleur users.controller et le middleware d'accès
 */
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const accessManager = require('../middleware/acessManager');

/**
 * Récupère tous les utilisateurs (admin uniquement)
 */
router.get('/', accessManager.authorizeRole("admin"), usersController.getAllUsers);

/**
 * Récupère un utilisateur par son ID
 */
router.get('/:id', usersController.getUserById);

/**
 * Crée un nouvel utilisateur
 */
router.post('/', usersController.createUser);

/**
 * Authentifie un utilisateur (login)
 */
router.post('/login', usersController.login);

/**
 * Met à jour un utilisateur
 */
router.put('/:id', usersController.updateUser);

/**
 * Supprime un utilisateur
 */
router.delete('/:id', usersController.deleteUser);

/**
 * Récupère l'utilisateur courant (depuis le token)
 */
router.get('/me', (req, res) => {
  res.json(req.user);
});

module.exports = router;
