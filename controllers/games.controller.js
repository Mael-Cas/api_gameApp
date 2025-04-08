const db = require("../db");

exports.getAllGames = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Games");
  res.json(rows);
};

exports.getGameById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Games WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
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
  } = req.body;
  const [result] = await db.query(
    "INSERT INTO Games (name, description, yearpublished, minplayers, maxplayers, playingtime, minplayingtime, maxplayingtime, minage, average_ranking, bayes_average, users_rated, game_rank, url, thumbnail, owned, trading, wanted, wishing) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
    ]
  );
  res.status(201).json({ id: result.insertId });
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
