/**
 * Contrôleur des jeux
 * Fournit les fonctions pour gérer les jeux (CRUD, recherche, etc.)
 * Utilise la base de données via le module db
 */
const db = require("../db");

/**
 * Récupère la liste paginée de tous les jeux.
 * @param {Request} req
 * @param {Response} res
 */
exports.getAllGames = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Compter le nombre total de jeux
    const [countResult] = await db.query("SELECT COUNT(*) as total FROM Games");
    const total = countResult[0].total;

    // Récupérer les jeux paginés
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
    res.status(500).json({ error: 'Error while fetching games' });
  }
};

/**
 * Récupère les détails d'un jeu par son ID.
 * @param {Request} req
 * @param {Response} res
 */
exports.getGameById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM game_full_details WHERE game_id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

/**
 * Recherche des jeux par nom.
 * @param {Request} req
 * @param {Response} res
 */
exports.searchGamesByName = async (req, res) => {
    console.log('searchGamesByName - Début de la fonction');
    console.log('searchGamesByName - Paramètres de requête:', req.query);
    
    const nameQuery = req.query.name;
    console.log('searchGamesByName - Nom recherché:', nameQuery);

    if (!nameQuery || nameQuery.trim() === "") {
        console.log('searchGamesByName - Erreur: paramètre name manquant ou vide');
        return res.status(400).json({ message: "Missing or empty 'name' query parameter" });
    }

    // Vérifier la longueur minimale
    if (nameQuery.length < 3) {
        console.log('searchGamesByName - Recherche trop courte, retour vide');
        return res.status(200).json({ games: [] });
    }

    try {
        console.log('searchGamesByName - Exécution de la requête SQL');
        // Recherche SQL avec LIKE et plus d'informations
        const [games] = await db.query(
            `SELECT g.*, 
                    GROUP_CONCAT(DISTINCT c.name) as categories,
                    GROUP_CONCAT(DISTINCT m.name) as mechanics,
                    GROUP_CONCAT(DISTINCT d.name) as designers,
                    GROUP_CONCAT(DISTINCT p.name) as publishers,
                    GROUP_CONCAT(DISTINCT a.name) as artists,
                    GROUP_CONCAT(DISTINCT f.name) as families,
                    GROUP_CONCAT(DISTINCT e.name) as expansions,
                    GROUP_CONCAT(DISTINCT i.name) as implementations
             FROM Games g
             LEFT JOIN Game_Categories gc ON g.Id = gc.Id
             LEFT JOIN Categories c ON gc.category_id = c.category_id
             LEFT JOIN Game_Mechanics gm ON g.Id = gm.Id
             LEFT JOIN Mechanics m ON gm.mechanic_id = m.mechanic_id
             LEFT JOIN Game_Designers gd ON g.Id = gd.Id
             LEFT JOIN Designers d ON gd.designer_id = d.designer_id
             LEFT JOIN Game_Publishers gp ON g.Id = gp.Id
             LEFT JOIN Publishers p ON gp.publisher_id = p.publisher_id
             LEFT JOIN Game_Artists ga ON g.Id = ga.Id
             LEFT JOIN Artists a ON ga.artist_id = a.artist_id
             LEFT JOIN Game_Families gf ON g.Id = gf.Id
             LEFT JOIN Families f ON gf.family_id = f.family_id
             LEFT JOIN Game_Expansions ge ON g.Id = ge.Id
             LEFT JOIN Expansions e ON ge.expansion_id = e.expansion_id
             LEFT JOIN Game_Implementations gi ON g.Id = gi.Id
             LEFT JOIN Implementations i ON gi.implementation_id = i.implementation_id
             WHERE g.name LIKE ?
             GROUP BY g.Id
             LIMIT 50`,
            [`%${nameQuery}%`]
        );

        console.log('searchGamesByName - Nombre de résultats trouvés:', games.length);

        // Formater les résultats pour séparer les listes
        const formattedGames = games.map(game => ({
            ...game,
            categories: game.categories ? game.categories.split(',') : [],
            mechanics: game.mechanics ? game.mechanics.split(',') : [],
            designers: game.designers ? game.designers.split(',') : [],
            publishers: game.publishers ? game.publishers.split(',') : [],
            artists: game.artists ? game.artists.split(',') : [],
            families: game.families ? game.families.split(',') : [],
            expansions: game.expansions ? game.expansions.split(',') : [],
            implementations: game.implementations ? game.implementations.split(',') : []
        }));

        console.log('searchGamesByName - Envoi de la réponse');
        res.status(200).json({ games: formattedGames });
    } catch (error) {
        console.error('searchGamesByName - Erreur:', error);
        console.error('searchGamesByName - Stack trace:', error.stack);
        res.status(500).json({ error: "Erreur lors de la recherche des jeux" });
    }
};

/**
 * Crée un nouveau jeu dans la base de données.
 * @param {Request} req
 * @param {Response} res
 */
exports.createGame = async (req, res) => {
  console.log('createGame - Début avec body:', req.body);
  
  const {
    name,
    description,
    yearpublished,
    minplayers,
    maxplayers,
    playingtime,
    minplaytime,
    maxplaytime,
    minage,
    average,
    bayes_average,
    users_rated,
    rank,
    url,
    thumbnail,
    owned,
    trading,
    wanting,
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
    console.log('createGame - Paramètres préparés:', {
      name, description, yearpublished, minplayers, maxplayers,
      playingtime, minplaytime, maxplaytime, minage, average,
      bayes_average, users_rated, rank, url, thumbnail,
      owned, trading, wanting, wishing, categories,
      mechanics, designers, publishers, artists,
      families, expansions, implementations
    });

    // Obtenir le prochain ID disponible
    const [maxIdResult] = await db.query('SELECT MAX(Id) as maxId FROM Games');
    const nextId = (maxIdResult[0].maxId || 0) + 1;

    // Insérer le jeu principal
    const [result] = await db.query(
      `INSERT INTO Games (
        Id, name, description, yearpublished, minplayers, maxplayers,
        playingtime, minplayingtime, maxplayingtime, minage, average_ranking,
        bayes_average, users_rated, game_rank, url, thumbnail,
        owned, trading, wanted, wishing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        name,
        description,
        yearpublished,
        minplayers,
        maxplayers,
        playingtime,
        minplaytime,
        maxplaytime,
        minage,
        average || null,
        bayes_average || null,
        users_rated || null,
        rank || null,
        url || null,
        thumbnail || null,
        owned || null,
        trading || null,
        wanting || null,
        wishing || null
      ]
    );

    console.log('createGame - Jeu inséré avec ID:', nextId);

    // Fonction utilitaire pour insérer les relations
    const insertRelation = async (table, name, gameId) => {
      try {
        // Mapping des noms de tables vers leurs IDs
        const idColumnMap = {
          'Categories': 'category_id',
          'Mechanics': 'mechanic_id',
          'Designers': 'designer_id',
          'Publishers': 'publisher_id',
          'Artists': 'artist_id',
          'Families': 'family_id',
          'Expansions': 'expansion_id',
          'Implementations': 'implementation_id'
        };

        const idColumn = idColumnMap[table];
        if (!idColumn) {
          throw new Error(`Table ${table} non reconnue`);
        }

        // Obtenir le prochain ID disponible pour la table
        const [maxIdResult] = await db.query(`SELECT MAX(${idColumn}) as maxId FROM ${table}`);
        const nextId = (maxIdResult[0].maxId || 0) + 1;

        // Vérifier si l'entité existe déjà
        const [existingEntity] = await db.query(
          `SELECT ${idColumn} FROM ${table} WHERE name = ?`,
          [name]
        );

        let entityId;
        if (existingEntity.length > 0) {
          entityId = existingEntity[0][idColumn];
        } else {
          // Insérer la nouvelle entité avec son ID
          await db.query(
            `INSERT INTO ${table} (${idColumn}, name) VALUES (?, ?)`,
            [nextId, name]
          );
          entityId = nextId;
        }

        // Insérer la relation
        await db.query(
          `INSERT INTO Game_${table} (Id, ${idColumn}) VALUES (?, ?)`,
          [gameId, entityId]
        );

        console.log(`createGame - Relation ${table} insérée avec succès:`, { name, entityId, gameId });
      } catch (error) {
        console.error(`createGame - Erreur lors de l'insertion de la relation ${table}:`, error);
        throw error;
      }
    };

    // Insérer les relations
    const insertAllRelations = async (items, table) => {
      if (!items || !Array.isArray(items)) return;
      for (const item of items) {
        await insertRelation(table, item, nextId);
      }
    };

    // Insérer les relations une par une pour mieux gérer les erreurs
    try {
      if (categories) await insertAllRelations(categories, 'Categories');
      if (mechanics) await insertAllRelations(mechanics, 'Mechanics');
      if (designers) await insertAllRelations(designers, 'Designers');
      if (publishers) await insertAllRelations(publishers, 'Publishers');
      if (artists) await insertAllRelations(artists, 'Artists');
      if (families) await insertAllRelations(families, 'Families');
      if (expansions) await insertAllRelations(expansions, 'Expansions');
      if (implementations) await insertAllRelations(implementations, 'Implementations');
    } catch (error) {
      console.error('createGame - Erreur lors de l\'insertion des relations:', error);
      // Supprimer le jeu principal en cas d'erreur
      await db.query('DELETE FROM Games WHERE Id = ?', [nextId]);
      throw error;
    }

    console.log('createGame - Toutes les relations ont été insérées');
    res.status(201).json({ 
      message: 'Jeu inséré avec succès.',
      gameId: nextId
    });
  } catch (error) {
    console.error('createGame - Erreur détaillée:', error);
    console.error('createGame - Stack trace:', error.stack);
    res.status(500).json({ 
      error: "Erreur lors de l'insertion du jeu.",
      details: error.message 
    });
  }
};

/**
 * Met à jour un jeu existant.
 * @param {Request} req
 * @param {Response} res
 */
exports.updateGame = async (req, res) => {
  try {
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
      artists,
      categories,
      mechanics,
      designers,
      publishers,
      families,
      expansions,
      implementations
    } = req.body;

    // Mise à jour du jeu
    const [result] = await db.query(
      `UPDATE Games 
       SET name = ?, 
           description = ?, 
           yearpublished = ?, 
           minplayers = ?, 
           maxplayers = ?, 
           playingtime = ?, 
           minplayingtime = ?, 
           maxplayingtime = ?, 
           minage = ?, 
           average_ranking = ?, 
           bayes_average = ?, 
           users_rated = ?, 
           game_rank = ?, 
           url = ?, 
           thumbnail = ?, 
           owned = ?, 
           trading = ?, 
           wanted = ?, 
           wishing = ? 
       WHERE Id = ?`,
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
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Jeu non trouvé' });
    }

    res.json({ message: 'Jeu mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du jeu" });
  }
};

/**
 * Supprime un jeu et toutes ses relations.
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    // Suppression des relations dans les tables associées
    await db.query('DELETE FROM Game_Artists WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Categories WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Mechanics WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Designers WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Publishers WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Families WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Expansions WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM Game_Implementations WHERE Id = ?', [gameId]);
    await db.query('DELETE FROM possess WHERE Id = ?', [gameId]);

    // Suppression du jeu principal
    const [result] = await db.query("DELETE FROM Games WHERE Id = ?", [gameId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Jeu non trouvé" });
    }

    res.json({ message: "Jeu supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du jeu" });
  }
};

/**
 * Récupère des jeux aléatoires pour un utilisateur et les ajoute à sa possession.
 * @param {Request} req
 * @param {Response} res
 */
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

        const [randomGames] = await db.query(sql, values);

        if (randomGames.length === 0) {
            return res.status(404).json({ message: "Aucun jeu disponible pour le swipe" });
        }

        // Ajouter les jeux à la possession de l'utilisateur
        for (const game of randomGames) {
            try {
                await db.query(
                    "INSERT INTO possess (Id, user_id, liked, favorite) VALUES (?, ?, 0, false)",
                    [game.Id, userId]
                );
            } catch (error) {
                if (error.code !== 'ER_DUP_ENTRY') {
                    throw error;
                }
            }
        }

        // Formater la réponse
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
        res.status(500).json({ error: "Erreur lors de la récupération des jeux aléatoires" });
    }
};

/**
 * Filtre les jeux selon plusieurs critères.
 * @param {Request} req
 * @param {Response} res
 */
exports.filterGames = async (req, res) => {
    try {
        console.log('filterGames - Début avec body:', req.body);
        
        const {
            players,
            maxDuration,
            minAge,
            categories,
            mechanics
        } = req.body;

        // Construction de la requête SQL de base
        let sql = `
            SELECT DISTINCT g.*, 
                   GROUP_CONCAT(DISTINCT c.name) as categories,
                   GROUP_CONCAT(DISTINCT m.name) as mechanics
            FROM Games g
            LEFT JOIN Game_Categories gc ON g.Id = gc.Id
            LEFT JOIN Categories c ON gc.category_id = c.category_id
            LEFT JOIN Game_Mechanics gm ON g.Id = gm.Id
            LEFT JOIN Mechanics m ON gm.mechanic_id = m.mechanic_id
        `;

        const conditions = [];
        const params = [];

        // Filtre par nombre de joueurs
        if (players) {
            const playerCount = parseInt(players);
            conditions.push('(g.minplayers <= ? AND g.maxplayers >= ?)');
            params.push(playerCount, playerCount);
        }

        // Filtre par durée maximale
        if (maxDuration) {
            const duration = parseInt(maxDuration);
            conditions.push('g.playingtime <= ?');
            params.push(duration);
        }

        // Filtre par âge minimum
        if (minAge) {
            const age = parseInt(minAge);
            conditions.push('g.minage <= ?');
            params.push(age);
        }

        // Filtre par catégories
        if (categories && Array.isArray(categories) && categories.length > 0) {
            conditions.push('c.name IN (?)');
            params.push(categories);
        }

        // Filtre par mécaniques
        if (mechanics && Array.isArray(mechanics) && mechanics.length > 0) {
            conditions.push('m.name IN (?)');
            params.push(mechanics);
        }

        // Ajout des conditions à la requête
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Groupement et limite
        sql += ' GROUP BY g.Id LIMIT 10';

        console.log('filterGames - Requête SQL:', sql);
        console.log('filterGames - Paramètres:', params);

        // Exécution de la requête
        const [games] = await db.query(sql, params);

        console.log('filterGames - Nombre de jeux trouvés:', games.length);

        // Formater les résultats
        const formattedGames = games.map(game => ({
            ...game,
            categories: game.categories ? game.categories.split(',') : [],
            mechanics: game.mechanics ? game.mechanics.split(',') : []
        }));

        // Renvoyer le format attendu par le frontend
        res.status(200).json({
            games: formattedGames,
            totalPages: Math.ceil(formattedGames.length / 10),
            currentPage: 1
        });
    } catch (error) {
        console.error('filterGames - Erreur:', error);
        res.status(500).json({ error: "Erreur lors de la récupération des jeux" });
    }
};




