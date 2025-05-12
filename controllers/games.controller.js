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
    res.status(500).json({ error: 'Erreur lors de l’insertion du jeu.' });
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
        let sql = `
      SELECT Id, name, thumbnail, description, 
      CONCAT(minplayers, ' - ', maxplayers) as players,
      playingtime, minage 
      FROM Games
    `;
        const values = [];

        if (minPlayers !== null) {
            sql += ` WHERE minplayers >= ?`;
            values.push(minPlayers);
        }

        sql += ` ORDER BY RAND() LIMIT 10`;

        const [randomGames] = await db.query(sql, values);

        if (randomGames.length === 0) {
            return res.status(404).json({ message: "No games found" });
        }

        for (const game of randomGames) {
            await db.query(
                "INSERT INTO possess (Id, user_id, liked, favorite) VALUES (?, ?, 0, false)",
                [game.Id, userId]
            );
        }

        res.status(201).json({ games: randomGames });
    } catch (error) {
        console.error('❌ Error in getRandomGamesAndPossess:', error);
        res.status(500).json({ error: 'Error while adding random games to user collection' });
    }
};


exports.favoriteGame = async (req, res) => {
    const {  gameId, favorite } = req.body;
    const userId = req.user.userId;

    if (typeof favorite !== 'boolean') {
        return res.status(400).json({ error: "'favorite' doit être un booléen." });
    }

    try {
        const [existing] = await db.query(
            "SELECT * FROM possess WHERE user_id = ? AND Id = ?",
            [userId, gameId]
        );

        if (existing.length === 0) {
            // Si l’entrée n’existe pas, on peut l’insérer avec le favori
            await db.query(
                "INSERT INTO possess (Id, user_id, liked, favorite) VALUES (?, ?, 0, ?)",
                [gameId, userId, favorite]
            );
        } else {
            // Sinon on met à jour le champ favorite
            await db.query(
                "UPDATE possess SET favorite = ? WHERE user_id = ? AND Id = ?",
                [favorite, userId, gameId]
            );
        }

        res.status(200).json({ message: "Mise à jour du favori réussie." });
    } catch (error) {
        console.error("❌ Error in favoriteGame:", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du favori." });
    }

}




