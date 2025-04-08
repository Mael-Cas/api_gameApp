const db = require("../db");

exports.getAllDesigners = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Designers");
  res.json(rows);
};

exports.getDesignerById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Designers WHERE designer_id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createDesigner = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Designers (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updateDesigner = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Designers SET name = ? WHERE designer_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Designer updated" });
};

exports.deleteDesigner = async (req, res) => {
  await db.query("DELETE FROM Designers WHERE designer_id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Designer deleted" });
};
