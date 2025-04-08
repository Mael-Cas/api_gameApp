const db = require("../db");

exports.getAllMechanics = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Mechanics");
  res.json(rows);
};

exports.getMechanicById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Mechanics WHERE mechanic_id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createMechanic = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Mechanics (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updateMechanic = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Mechanics SET name = ? WHERE mechanic_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Mechanic updated" });
};

exports.deleteMechanic = async (req, res) => {
  await db.query("DELETE FROM Mechanics WHERE mechanic_id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Mechanic deleted" });
};
