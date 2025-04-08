const db = require("../db");

exports.getAllGameImplementations = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Implementations");
  res.json(rows);
};

exports.getImplementationsByGameId = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Game_Implementations WHERE Id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameImplementation = async (req, res) => {
  const { Id, implementation_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Implementations (Id, implementation_id) VALUES (?, ?)",
    [Id, implementation_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameImplementation = async (req, res) => {
  const { Id, implementation_id } = req.body;
  await db.query(
    "DELETE FROM Game_Implementations WHERE Id = ? AND implementation_id = ?",
    [[Id, implementation_id]]
  );
  res.json({ message: "GameImplementation deleted" });
};
