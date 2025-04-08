const db = require("../db");

exports.getAllCategories = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Categories");
  res.json(rows);
};

exports.getCategoryById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Categories WHERE category_id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Categories (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Categories SET name = ? WHERE category_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Category updated" });
};

exports.deleteCategory = async (req, res) => {
  await db.query("DELETE FROM Categories WHERE category_id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Category deleted" });
};
