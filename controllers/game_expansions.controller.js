const db = require("../db");

exports.getAllGameExpansions = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Expansions");
  res.json(rows);
};

exports.getExpansionsByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Expansions WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameExpansion = async (req, res) => {
  const { Id, expansion_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Expansions (Id, expansion_id) VALUES (?, ?)",
    [Id, expansion_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameExpansion = async (req, res) => {
  const { Id, expansion_id } = req.body;
  await db.query(
    "DELETE FROM Game_Expansions WHERE Id = ? AND expansion_id = ?",
    [Id, expansion_id]
  );
  res.json({ message: "GameExpansion deleted" });
};
