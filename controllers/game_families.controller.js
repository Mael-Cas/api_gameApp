const db = require("../db");

exports.getAllGameFamilies = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Families");
  res.json(rows);
};

exports.getFamiliesByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Families WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameFamily = async (req, res) => {
  const { Id, family_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Families (Id, family_id) VALUES (?, ?)",
    [Id, family_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameFamily = async (req, res) => {
  const { Id, family_id } = req.body;
  await db.query("DELETE FROM Game_Families WHERE Id = ? AND family_id = ?", [
    Id,
    family_id,
  ]);
  res.json({ message: "GameFamily deleted" });
};
