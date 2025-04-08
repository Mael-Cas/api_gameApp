const db = require("../db");

exports.getAllExpansions = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Expansions");
  res.json(rows);
};

exports.getExpansionById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Expansions WHERE expansion_id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createExpansion = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Expansions (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updateExpansion = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Expansions SET name = ? WHERE expansion_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Expansion updated" });
};

exports.deleteExpansion = async (req, res) => {
  await db.query("DELETE FROM Expansions WHERE expansion_id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Expansion deleted" });
};
