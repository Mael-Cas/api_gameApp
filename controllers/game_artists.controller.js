const db = require("../db");

exports.getAllGameArtists = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Artists");
  res.json(rows);
};

exports.getArtistsByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Artists WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameArtist = async (req, res) => {
  const { Id, artist_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Artists (Id, artist_id) VALUES (?, ?)",
    [Id, artist_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameArtist = async (req, res) => {
  const { Id, artist_id } = req.body;
  await db.query("DELETE FROM Game_Artists WHERE Id = ? AND artist_id = ?", [
    Id,
    artist_id,
  ]);
  res.json({ message: "GameArtist deleted" });
};
