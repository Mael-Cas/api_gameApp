const db = require('../db');

exports.getAll = async (req, res) => {
  
  const [rows] = await db.query(`SELECT * FROM ??`, [req.params.table]);
  res.json(rows);
};

exports.getById = async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM ?? WHERE id = ?`, [req.params.table, req.params.id]);
  res.json(rows[0] || null);
};

exports.create = async (req, res) => {
  const { description } = req.body;
  const [result] = await db.query(`INSERT INTO ?? (description) VALUES (?)`, [req.params.table, description]);
  res.status(201).json({ id: result.insertId });
};

exports.update = async (req, res) => {
  const { description } = req.body;
  await db.query(`UPDATE ?? SET description = ? WHERE id = ?`, [req.params.table, description, req.params.id]);
  res.sendStatus(204);
};

exports.remove = async (req, res) => {
  await db.query(`DELETE FROM ?? WHERE id = ?`, [req.params.table, req.params.id]);
  res.sendStatus(204);
};
