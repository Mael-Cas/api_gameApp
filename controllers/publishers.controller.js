const db = require("../db");

exports.getAllPublishers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Publishers");
  res.json(rows);
};

exports.getPublisherById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Publishers WHERE publisher_id = ?",
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createPublisher = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Publishers (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updatePublisher = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Publishers SET name = ? WHERE publisher_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Publisher updated" });
};

exports.deletePublisher = async (req, res) => {
  await db.query("DELETE FROM Publishers WHERE publisher_id = ?", [
    req.params.id,
  ]);
  res.json({ message: "Publisher deleted" });
};
