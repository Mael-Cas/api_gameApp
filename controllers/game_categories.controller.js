const db = require("../db");

exports.getAllGameCategories = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Categories");
  res.json(rows);
};

exports.getCategoriesByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Categories WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameCategory = async (req, res) => {
  const { Id, category_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Categories (Id, category_id) VALUES (?, ?)",
    [Id, category_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameCategory = async (req, res) => {
  const { Id, category_id } = req.body;
  await db.query(
    "DELETE FROM Game_Categories WHERE Id = ? AND category_id = ?",
    [Id, category_id]
  );
  res.json({ message: "GameCategory deleted" });
};
