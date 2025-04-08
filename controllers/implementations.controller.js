const db = require("../db");

exports.getAllImplementations = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Implementations");
  res.json(rows);
};

exports.getImplementationById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Implementations WHERE implementation_id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createImplementation = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query(
    "INSERT INTO Implementations (name) VALUES (?)",
    [name]
  );
  res.status(201).json({ id: result.insertId });
};

exports.updateImplementation = async (req, res) => {
  const { name } = req.body;
  await db.query(
    "UPDATE Implementations SET name = ? WHERE implementation_id = ?",
    [name, req.params.id]
  );
  res.json({ message: "Implementation updated" });
};

exports.deleteImplementation = async (req, res) => {
  await db.query("DELETE FROM Implementations WHERE implementation_id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Implementation deleted" });
};
