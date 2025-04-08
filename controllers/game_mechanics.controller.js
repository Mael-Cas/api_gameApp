const db = require("../db");

exports.getAllGameMechanics = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Mechanics");
  res.json(rows);
};

exports.getMechanicsByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Mechanics WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameMechanic = async (req, res) => {
  const { Id, mechanic_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Mechanics (Id, mechanic_id) VALUES (?, ?)",
    [Id, mechanic_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameMechanic = async (req, res) => {
  const { Id, mechanic_id } = req.body;
  await db.query(
    "DELETE FROM Game_Mechanics WHERE Id = ? AND mechanic_id = ?",
    [Id, mechanic_id]
  );
  res.json({ message: "GameMechanic deleted" });
};
