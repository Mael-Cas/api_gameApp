const db = require("../db");

exports.getAllGameUsers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Users");
  res.json(rows);
};

exports.getUsersByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Users WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameUser = async (req, res) => {
  const { Id, user_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Users (Id, user_id) VALUES (?, ?)",
    [Id, user_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameUser = async (req, res) => {
  const { Id, user_id } = req.body;
  await db.query("DELETE FROM Game_Users WHERE Id = ? AND user_id = ?", [
    Id,
    user_id,
  ]);
  res.json({ message: "GameUser deleted" });
};
