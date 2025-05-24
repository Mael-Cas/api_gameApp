/**
 * Routeur des relations de possession (possess)
 * Définit les routes pour gérer les statuts de possession, favoris, swipes, recommandations, etc.
 * Utilise le contrôleur possess.controller et le middleware d'accès
 */
const express = require('express');
const router = express.Router();
const possessController = require('../controllers/possess.controller');
const accessManager = require('../middleware/acessManager');

// Toutes les routes sont protégées par JWT
router.use(accessManager.RouterAccess);

/**
 * Récupère toutes les relations de possession
 */
router.get('/', possessController.getAllGameUsers);

/**
 * Vérifie si un utilisateur possède un jeu donné
 */
router.get('/game/:id', possessController.getUsersByGameId);

/**
 * Récupère tous les jeux favoris de l'utilisateur
 */
router.get('/favorites', possessController.getUserFavorites);

/**
 * Récupère tous les jeux non appréciés de l'utilisateur
 */
router.get('/unfavorites', possessController.getUserUnfavorites);

/**
 * Crée une relation de possession pour un jeu
 */
router.post('/', possessController.createGameUser);

/**
 * Met à jour le statut favori/non-apprécié d'un jeu
 */
router.post('/:id', possessController.updateGameStatus);

/**
 * Supprime une relation de possession pour un jeu
 */
router.delete('/:id', possessController.deleteGameUser);

/**
 * Gère le swipe (like/dislike) d'un jeu
 */
router.post('/:id/swipe', possessController.swipeGame);

/**
 * Recommande des jeux à l'utilisateur
 */
router.get('/recommend', possessController.recommend_game);

/**
 * Récupère des recommandations personnalisées
 */
router.get('/recommendations', possessController.getPersonalizedRecommendations);

module.exports = router;
