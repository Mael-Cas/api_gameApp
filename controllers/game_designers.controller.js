const db = require("../db");

exports.getAllGameDesigners = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Designers");
  res.json(rows);
};

exports.getDesignersByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Designers WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameDesigner = async (req, res) => {
  const { Id, designer_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Designers (Id, designer_id) VALUES (?, ?)",
    [Id, designer_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameDesigner = async (req, res) => {
  const { Id, designer_id } = req.body;
  await db.query(
    "DELETE FROM Game_Designers WHERE Id = ? AND designer_id = ?",
    [Id, designer_id]
  );
  res.json({ message: "GameDesigner deleted" });
};
