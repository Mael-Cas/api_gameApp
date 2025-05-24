/**
 * Contrôleur de la table possess (relation utilisateur-jeu)
 * Fournit les fonctions pour gérer les statuts de possession, favoris, swipes, recommandations, etc.
 * Utilise la base de données via le module db
 */
const db = require("../db");
// const possessService = require('../services/possess.service');

/**
 * Récupère toutes les relations de possession (tous les jeux possédés par tous les utilisateurs).
 * @param {Request} req
 * @param {Response} res
 */
const getAllGameUsers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM possess");
  res.json(rows);
};

/**
 * Vérifie si un utilisateur possède un jeu donné et retourne les statuts associés.
 * @param {Request} req
 * @param {Response} res
 */
const getUsersByGameId = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM possess WHERE Id = ? AND user_id = ?",
      [req.params.id, req.user.userId]
    );
    
    if (rows.length === 0) {
      return res.json({ 
        isInPossess: false, 
        favorite: false, 
        unfavorite: false,
        liked: false
      });
    }
    
    res.json({
      isInPossess: true,
      favorite: Boolean(rows[0].favorite),
      unfavorite: Boolean(rows[0].unfavorite),
      liked: Boolean(rows[0].liked)
    });
  } catch (error) {
    console.error("❌ Error in getUsersByGameId:", error);
    res.status(500).json({ error: "Erreur lors de la vérification de possession" });
  }
};

/**
 * Met à jour le statut favori/non-apprécié d'un jeu pour un utilisateur.
 * @param {Request} req
 * @param {Response} res
 */
const updateGameStatus = async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;
    const { favorite, unfavorite } = req.body;

    console.log('updateGameStatus - Paramètres reçus:', { gameId, userId, favorite, unfavorite });

    // Vérifier si l'entrée existe déjà
    const [existing] = await db.query(
      "SELECT * FROM possess WHERE Id = ? AND user_id = ?",
      [gameId, userId]
    );

    console.log('updateGameStatus - Entrée existante:', existing);

    if (existing.length > 0) {
      // Mettre à jour l'entrée existante
      await db.query(
        "UPDATE possess SET favorite = ?, unfavorite = ? WHERE Id = ? AND user_id = ?",
        [favorite, unfavorite, gameId, userId]
      );
    } else {
      // Créer une nouvelle entrée
      await db.query(
        "INSERT INTO possess (Id, user_id, favorite, unfavorite) VALUES (?, ?, ?, ?)",
        [gameId, userId, favorite, unfavorite]
      );
    }

    // Vérifier la mise à jour
    const [updated] = await db.query(
      "SELECT * FROM possess WHERE Id = ? AND user_id = ?",
      [gameId, userId]
    );
    console.log('updateGameStatus - Entrée mise à jour:', updated);

    res.status(200).json({
      success: true,
      message: favorite ? "Jeu ajouté aux favoris" : unfavorite ? "Jeu ajouté aux non appréciés" : "Statut du jeu mis à jour",
      data: {
        favorite: Boolean(updated[0].favorite),
        unfavorite: Boolean(updated[0].unfavorite)
      }
    });
  } catch (error) {
    console.error("❌ Error in updateGameStatus:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de la mise à jour du statut du jeu",
      details: error.message
    });
  }
};

/**
 * Ajoute ou met à jour une entrée de possession pour un jeu et un utilisateur.
 * @param {Request} req
 * @param {Response} res
 */
const createGameUser = async (req, res) => {
  try {
    const gameId = req.params.id || req.body.Id;
    const userId = req.user.userId;
    const { favorite, unfavorite } = req.body;

    // Vérifier si l'entrée existe déjà
    const [existing] = await db.query(
      "SELECT * FROM possess WHERE Id = ? AND user_id = ?",
      [gameId, userId]
    );

    if (existing.length > 0) {
      // Mettre à jour l'entrée existante
      await db.query(
        "UPDATE possess SET favorite = ?, unfavorite = ? WHERE Id = ? AND user_id = ?",
        [favorite, unfavorite, gameId, userId]
      );
    } else {
      // Créer une nouvelle entrée
      await db.query(
        "INSERT INTO possess (Id, user_id, favorite, unfavorite) VALUES (?, ?, ?, ?)",
        [gameId, userId, favorite, unfavorite]
      );
    }

    res.status(201).json({ message: favorite ? "Jeu ajouté aux favoris" : "Jeu ajouté aux non appréciés" });
  } catch (error) {
    console.error("❌ Error in createGameUser:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout du jeu" });
  }
};

/**
 * Met à jour ou supprime le statut favori/non-apprécié d'un jeu pour un utilisateur.
 * @param {Request} req
 * @param {Response} res
 */
const deleteGameUser = async (req, res) => {
  try {
    const gameId = req.params.id || req.body.Id;
    const userId = req.user.userId;
    const { favorite, unfavorite } = req.body;

    // Si on ne spécifie pas quel statut supprimer, on supprime les deux
    if (favorite === undefined && unfavorite === undefined) {
      await db.query(
        "UPDATE possess SET favorite = false, unfavorite = false WHERE Id = ? AND user_id = ?",
        [gameId, userId]
      );
    } else {
      // Sinon, on met à jour uniquement le statut spécifié
      const updates = [];
      const params = [];
      
      if (favorite !== undefined) {
        updates.push("favorite = ?");
        params.push(favorite);
      }
      
      if (unfavorite !== undefined) {
        updates.push("unfavorite = ?");
        params.push(unfavorite);
      }
      
      if (updates.length > 0) {
        params.push(gameId, userId);
        await db.query(
          `UPDATE possess SET ${updates.join(", ")} WHERE Id = ? AND user_id = ?`,
          params
        );
      }
    }
    
    res.json({ message: "Statut du jeu mis à jour" });
  } catch (error) {
    console.error("❌ Error in deleteGameUser:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du statut" });
  }
};

/**
 * Gère le swipe (like/dislike) d'un jeu par un utilisateur.
 * @param {Request} req
 * @param {Response} res
 */
const swipeGame = async (req, res) => {
  const gameId = req.params.id;
  const userId = req.user.userId;
  const { swipe } = req.body; // doit être 1 (like) ou -1 (dislike)

  console.log('swipeGame - Paramètres reçus:', { gameId, userId, swipe });

  // Validation rapide
  if (![1, -1].includes(swipe)) {
    return res.status(400).json({ message: "Swipe must be 1 (like) or -1 (dislike)" });
  }

  try {
    // Vérifier si l'entrée existe déjà
    const [existing] = await db.query(
      "SELECT * FROM possess WHERE Id = ? AND user_id = ?",
      [gameId, userId]
    );

    console.log('swipeGame - Entrée existante:', existing);

    if (existing.length > 0) {
      // Mettre à jour l'entrée existante
      await db.query(
        "UPDATE possess SET liked = ? WHERE Id = ? AND user_id = ?",
        [swipe === 1, gameId, userId]
      );
    } else {
      // Créer une nouvelle entrée
      await db.query(
        "INSERT INTO possess (Id, user_id, liked) VALUES (?, ?, ?)",
        [gameId, userId, swipe === 1]
      );
    }

    // Vérifier la mise à jour
    const [updated] = await db.query(
      "SELECT * FROM possess WHERE Id = ? AND user_id = ?",
      [gameId, userId]
    );
    console.log('swipeGame - Entrée mise à jour:', updated);

    res.status(200).json({
      message: "Swipe enregistré avec succès",
      liked: swipe === 1
    });
  } catch (error) {
    console.error("❌ Error in swipeGame:", error);
    res.status(500).json({ error: "Erreur lors du swipe du jeu" });
  }
};

/**
 * Recommande des jeux à un utilisateur via une procédure stockée.
 * @param {Request} req
 * @param {Response} res
 */
const recommend_game = async (req, res) => {
  try {
    console.log('recommend_game - Début de la requête pour l\'utilisateur:', req.user.userId);
    
    // Appeler la procédure stockée
    const [result] = await db.query("CALL recommend_games_for_user(?)", [req.user.userId]);
    console.log('recommend_game - Résultat de la procédure:', result);
    
    // Vérifier si nous avons des résultats
    if (!result || result.length === 0) {
      console.log('recommend_game - Aucune recommandation trouvée');
      return res.status(200).json({ 
        result: [[]],
        message: 'Aucune recommandation disponible pour le moment. Essayez de liker quelques jeux pour obtenir des recommandations personnalisées.'
      });
    }
    
    // Formater la réponse
    const recommendations = result[0];
    console.log('recommend_game - Nombre de recommandations:', recommendations.length);
    
    res.status(200).json({ 
      result: [recommendations],
      message: 'Recommandations récupérées avec succès'
    });
  } catch (error) {
    console.error("❌ Error in recommend_game:", error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des recommandations",
      details: error.message
    });
  }
};

/**
 * Récupère tous les jeux favoris d'un utilisateur.
 * @param {Request} req
 * @param {Response} res
 */
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Récupérer tous les jeux favoris de l'utilisateur avec leurs détails
    const [rows] = await db.query(`
      SELECT g.*, p.favorite, p.unfavorite, p.liked
      FROM Games g
      INNER JOIN possess p ON g.Id = p.Id
      WHERE p.user_id = ? AND p.favorite = true
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error in getUserFavorites:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des favoris" });
  }
};

/**
 * Récupère tous les jeux non appréciés d'un utilisateur.
 * @param {Request} req
 * @param {Response} res
 */
const getUserUnfavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Récupérer tous les jeux non appréciés de l'utilisateur avec leurs détails
    const [rows] = await db.query(`
      SELECT g.*, p.favorite, p.unfavorite, p.liked
      FROM Games g
      INNER JOIN possess p ON g.Id = p.Id
      WHERE p.user_id = ? AND p.unfavorite = true
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error in getUserUnfavorites:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des jeux non appréciés" });
  }
};

/**
 * Récupère des recommandations personnalisées selon le nombre de joueurs.
 * @param {Request} req
 * @param {Response} res
 */
const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { playerCount } = req.query;

        console.log('getPersonalizedRecommendations - Paramètres reçus:', { userId, playerCount });

        if (!userId || !playerCount) {
            return res.status(400).json({
                success: false,
                message: 'User ID and player count are required'
            });
        }

        // Vérifier les likes de l'utilisateur
        const [userLikes] = await db.query(
            "SELECT * FROM possess WHERE user_id = ? AND liked = true",
            [userId]
        );
        console.log('getPersonalizedRecommendations - Likes de l\'utilisateur:', userLikes);

        const [recommendations] = await db.query(
            'CALL get_personalized_recommendations(?, ?)',
            [userId, parseInt(playerCount)]
        );

        console.log('getPersonalizedRecommendations - Recommandations brutes:', recommendations);

        if (!recommendations || !recommendations[0] || recommendations[0].length === 0) {
            return res.json({
                success: true,
                recommendations: [],
                message: 'Aucune recommandation trouvée pour le moment. Continuez à swiper pour obtenir des recommandations personnalisées.'
            });
        }

        return res.json({
            success: true,
            recommendations: recommendations[0]
        });
    } catch (error) {
        console.error('Error in getPersonalizedRecommendations:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting personalized recommendations'
        });
    }
};

module.exports = {
    getAllGameUsers,
    getUsersByGameId,
    updateGameStatus,
    createGameUser,
    deleteGameUser,
    swipeGame,
    recommend_game,
    getUserFavorites,
    getUserUnfavorites,
    getPersonalizedRecommendations
};
