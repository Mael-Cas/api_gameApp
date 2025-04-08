const db = require("../db");

exports.getAllUsers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Users");
  res.json(rows);
};

exports.getUserById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Users WHERE user_id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createUser = async (req, res) => {
  const { email, password, permission } = req.body;
  const [result] = await db.query(
    "INSERT INTO Users (email, password, permission) VALUES (?, ?, ?)",
    [email, password, permission]
  );
  res.status(201).json({ id: result.insertId });
};

exports.updateUser = async (req, res) => {
  const { email, password, permission } = req.body;
  await db.query(
    "UPDATE Users SET email = ?, password = ?, permission = ? WHERE user_id = ?",
    [email, password, permission, req.params.id]
  );
  res.json({ message: "User updated" });
};

exports.deleteUser = async (req, res) => {
  await db.query("DELETE FROM Users WHERE user_id = ?", [req.params.id]);
  res.json({ message: "User deleted" });
};
