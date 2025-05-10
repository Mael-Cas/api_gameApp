const db = require("../db");

exports.getAllGames = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Games");
  res.json(rows);
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




