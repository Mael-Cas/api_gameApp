const db = require("../db");

exports.getAllFamilies = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Families");
  res.json(rows);
};

exports.getFamilyById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Families WHERE family_id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createFamily = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Families (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updateFamily = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Families SET name = ? WHERE family_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Family updated" });
};

exports.deleteFamily = async (req, res) => {
  await db.query("DELETE FROM Families WHERE family_id = ?", [req.params.id]);
  res.json({ message: "Family deleted" });
};
