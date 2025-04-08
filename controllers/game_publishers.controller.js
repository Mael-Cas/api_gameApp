const db = require("../db");

exports.getAllGamePublishers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Publishers");
  res.json(rows);
};

exports.getPublishersByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Publishers WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGamePublisher = async (req, res) => {
  const { Id, publisher_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Publishers (Id, publisher_id) VALUES (?, ?)",
    [Id, publisher_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGamePublisher = async (req, res) => {
  const { Id, publisher_id } = req.body;
  await db.query(
    "DELETE FROM Game_Publishers WHERE Id = ? AND publisher_id = ?",
    [Id, publisher_id]
  );
  res.json({ message: "GamePublisher deleted" });
};
