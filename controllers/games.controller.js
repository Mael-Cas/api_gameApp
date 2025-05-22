const db = require("../db");

exports.getAllGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count of games
    const [countResult] = await db.query("SELECT COUNT(*) as total FROM Games");
    const total = countResult[0].total;

    // Get paginated games
    const [rows] = await db.query(
      "SELECT * FROM Games LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({
      games: rows,
      pagination: {
        total,
        page,
        limit,
        hasMore: offset + rows.length < total
      }
    });
  } catch (error) {
    console.error('❌ Error in getAllGames:', error);
    res.status(500).json({ error: 'Error while fetching games' });
  }
};

exports.getGameById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM game_full_details WHERE game_id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.searchGamesByName = async (req, res) => {
    const nameQuery = req.query.name;

    if (!nameQuery || nameQuery.trim() === "") {
        return res.status(400).json({ message: "Missing or empty 'name' query parameter" });
    }

    try {
        const [games] = await db.query(
            `SELECT Id, name, thumbnail, description, 
              CONCAT(minplayers, ' - ', maxplayers) AS players,
              playingtime, minage 
       FROM Games 
       WHERE name LIKE ?`,
            [`%${nameQuery}%`]
        );

        res.status(200).json({ games });
    } catch (error) {
        console.error("❌ Error in searchGamesByName:", error);
        res.status(500).json({ error: "Error while searching for games" });
    }
};


exports.createGame = async (req, res) => {
  const {
    name,
    description,
    yearpublished,
    minplayers,
    maxplayers,
    playingtime,
    minplayingtime,
    maxplayingtime,
    minage,
    average_ranking,
    bayes_average,
    users_rated,
    game_rank,
    url,
    thumbnail,
    owned,
    trading,
    wanted,
    wishing,
    categories,
    mechanics,
    designers,
    publishers,
    artists,
    families,
    expansions,
    implementations
  } = req.body;

  try {
    const [result] = await db.query(
      `CALL add_full_game(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        yearpublished,
        minplayers,
        maxplayers,
        playingtime,
        minplayingtime,
        maxplayingtime,
        minage,
        average_ranking,
        bayes_average,
        users_rated,
        game_rank,
        url,
        thumbnail,
        owned,
        trading,
        wanted,
        wishing,
        categories,       // ex: '1,2,6'
        mechanics,        // ex: '5,7,10'
        designers,
        publishers,
        artists,
        families,
        expansions,
        implementations
      ]
    );

    res.status(201).json({ message: 'Jeu inséré avec succès.' });
  } catch (error) {
    console.error('❌ Erreur dans add_full_game :', error);
    res.status(500).json({ error: "Erreur lors de l'insertion du jeu." });
  }
};

exports.updateGame = async (req, res) => {
  const {
    name,
    description,
    yearpublished,
    minplayers,
    maxplayers,
    playingtime,
    minplayingtime,
    maxplayingtime,
    minage,
    average_ranking,
    bayes_average,
    users_rated,
    game_rank,
    url,
    thumbnail,
    owned,
    trading,
    wanted,
    wishing,
  } = req.body;
  await db.query(
    "UPDATE Games SET name = ?, description = ?, yearpublished = ?, minplayers = ?, maxplayers = ?, playingtime = ?, minplayingtime = ?, maxplayingtime = ?, minage = ?, average_ranking = ?, bayes_average = ?, users_rated = ?, game_rank = ?, url = ?, thumbnail = ?, owned = ?, trading = ?, wanted = ?, wishing = ? WHERE Id = ?",
    [
      name,
      description,
      yearpublished,
      name,
      description,
      yearpublished,
      minplayers,
      maxplayers,
      playingtime,
      minplayingtime,
      maxplayingtime,
      minage,
      average_ranking,
      bayes_average,
      users_rated,
      game_rank,
      url,
      thumbnail,
      owned,
      trading,
      wanted,
      wishing,
      req.params.id,
    ]
  );
  res.json({ message: "Game updated" });
};

exports.deleteGame = async (req, res) => {
  await db.query("DELETE FROM Games WHERE Id = ?", [req.params.id]);
  res.json({ message: "Game deleted" });
};

exports.getRandomGamesAndPossess = async (req, res) => {
    const userId = req.params.userId;
    const minPlayers = req.query.minPlayers ? Number(req.query.minPlayers) : null;

    try {
        // Vérifier que l'utilisateur existe
        const [user] = await db.query("SELECT user_id FROM Users WHERE user_id = ?", [userId]);
        if (user.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Sélectionner des jeux aléatoires qui ne sont pas déjà dans la table possess pour cet utilisateur
        let sql = `
            SELECT g.Id, g.name, g.thumbnail, g.description, 
                   g.minplayers, g.maxplayers, g.playingtime, g.minage,
                   g.average_ranking, g.bayes_average, g.users_rated, g.game_rank,
                   g.url, g.owned, g.trading, g.wanted, g.wishing
            FROM Games g
            WHERE NOT EXISTS (
                SELECT 1 FROM possess p 
                WHERE p.Id = g.Id AND p.user_id = ?
            )
        `;
        const values = [userId];

        if (minPlayers !== null) {
            sql += ` AND g.minplayers >= ?`;
            values.push(minPlayers);
        }

        sql += ` ORDER BY RAND() LIMIT 10`;

        console.log('SQL Query:', sql);
        console.log('Values:', values);

        const [randomGames] = await db.query(sql, values);
        console.log('Random games found:', randomGames.length);

        if (randomGames.length === 0) {
            return res.status(404).json({ message: "Aucun jeu disponible pour le swipe" });
        }

        // Insérer les jeux dans la table possess
        for (const game of randomGames) {
            try {
                await db.query(
                    "INSERT INTO possess (Id, user_id, liked, favorite) VALUES (?, ?, 0, false)",
                    [game.Id, userId]
                );
            } catch (error) {
                console.error('Error inserting into possess:', error);
                // Ignorer les erreurs de doublon
                if (error.code !== 'ER_DUP_ENTRY') {
                    throw error;
                }
            }
        }

        // Formater les jeux pour la réponse
        const formattedGames = randomGames.map(game => ({
            id: game.Id,
            name: game.name,
            description: game.description,
            thumbnail: game.thumbnail,
            minplayers: game.minplayers,
            maxplayers: game.maxplayers,
            playingtime: game.playingtime,
            minage: game.minage,
            average_ranking: game.average_ranking,
            bayes_average: game.bayes_average,
            users_rated: game.users_rated,
            game_rank: game.game_rank,
            url: game.url,
            owned: game.owned,
            trading: game.trading,
            wanted: game.wanted,
            wishing: game.wishing
        }));

        res.json({ games: formattedGames });
    } catch (error) {
        console.error('❌ Error in getRandomGamesAndPossess:', error);
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        res.status(500).json({ error: "Erreur lors de la récupération des jeux aléatoires" });
    }
};


exports.favoriteGame = async (req, res) => {
    const {  gameId, favorite, unfavorite } = req.body;
    const userId = req.user.userId;

    if (typeof favorite !== 'boolean' || typeof unfavorite !== 'boolean') {
        return res.status(400).json({ error: "'favorite' et 'unfavorite' doivent être des booléens." });
    }

    try {
        const [existing] = await db.query(
            "SELECT * FROM possess WHERE user_id = ? AND Id = ?",
            [userId, gameId]
        );

        if (existing.length === 0) {
            await db.query(
                "INSERT INTO possess (Id, user_id, liked, favorite, unfavorite) VALUES (?, ?, 0, ?, ?)",
                [gameId, userId, favorite, unfavorite]
            );
        } else {
            await db.query(
                "UPDATE possess SET favorite = ?, unfavorite = ? WHERE user_id = ? AND Id = ?",
                [favorite, unfavorite, userId, gameId]
            );
        }

        res.status(200).json({ message: "Mise à jour favorite/unfavorite réussie." });
    } catch (error) {
        console.error("❌ Error in favoriteGame:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du favori." });
    }

}

exports.getFavoriteGame = async (req, res) => {

    const userId = req.user.userId;

    try {
        // Récupère les jeux favoris pour un utilisateur donné en utilisant la vue
        const [favoriteGames] = await db.query(
            "SELECT * FROM user_favorite_game WHERE user_id = ?",
            [userId]
        );

        if (favoriteGames.length === 0) {
            return res.status(404).json({ message: "Aucun jeu favori trouvé pour cet utilisateur." });
        }

        res.status(200).json({ favoriteGames });
    } catch (error) {
        console.error("❌ Error in getFavoriteGame:", error);
        res.status(500).json({ error: "Erreur lors de la récupération des jeux favoris." });
    }

}

exports.updateGameLikeStatus = async (req, res) => {
    const { gameId } = req.params;
    const { liked, userId } = req.body;

    try {
        // S'assurer que liked est soit 1 soit -1
        const likedValue = liked > 0 ? 1 : -1;

        // Mettre à jour le statut liked dans la table possess
        await db.query(
            "UPDATE possess SET liked = ? WHERE Id = ? AND user_id = ?",
            [likedValue, gameId, userId]
        );

        res.json({ message: "Statut du jeu mis à jour avec succès" });
    } catch (error) {
        console.error('❌ Error in updateGameLikeStatus:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du statut du jeu" });
    }
};




