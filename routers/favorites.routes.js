const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Récupérer tous les favoris d'un utilisateur
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [favorites] = await db.query(
            'SELECT g.* FROM games g JOIN favorites f ON g.game_id = f.game_id WHERE f.user_id = ?',
            [userId]
        );
        console.log(`GET /favorites - Récupération des favoris pour l'utilisateur ${userId}`);
        res.json(favorites);
    } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Ajouter un jeu aux favoris
router.post('/:gameId', authenticateToken, async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.userId;
        console.log(`POST /favorites/:gameId - Ajout du jeu ${gameId} aux favoris`);

        // Vérifier si le jeu existe
        const [game] = await db.query('SELECT * FROM games WHERE game_id = ?', [gameId]);
        if (game.length === 0) {
            return res.status(404).json({ message: 'Jeu non trouvé' });
        }

        // Vérifier si le jeu est déjà en favoris
        const [existing] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Jeu déjà en favoris' });
        }

        // Ajouter aux favoris
        await db.query(
            'INSERT INTO favorites (user_id, game_id) VALUES (?, ?)',
            [userId, gameId]
        );

        res.status(201).json({ message: 'Jeu ajouté aux favoris' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer un jeu des favoris
router.delete('/:gameId', authenticateToken, async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.userId;
        console.log(`DELETE /favorites/:gameId - Suppression du jeu ${gameId} des favoris`);

        const [result] = await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Favori non trouvé' });
        }

        res.json({ message: 'Jeu supprimé des favoris' });
    } catch (error) {
        console.error('Erreur lors de la suppression des favoris:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Vérifier si un jeu est en favoris
router.get('/check/:gameId', authenticateToken, async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.userId;
        console.log(`GET /favorites/check/:gameId - Vérification du jeu ${gameId}`);

        const [favorite] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
        );

        res.json({ isFavorite: favorite.length > 0 });
    } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 