const db = require("../db");

exports.getAllArtists = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Artists");
  res.json(rows);
};

exports.getArtistById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Artists WHERE artist_id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

exports.createArtist = async (req, res) => {
  const { name } = req.body;
  const [result] = await db.query("INSERT INTO Artists (name) VALUES (?)", [
    name,
  ]);
  res.status(201).json({ id: result.insertId });
};

exports.updateArtist = async (req, res) => {
  const { name } = req.body;
  await db.query("UPDATE Artists SET name = ? WHERE artist_id = ?", [
    name,
    req.params.id,
  ]);
  res.json({ message: "Artist updated" });
};

exports.deleteArtist = async (req, res) => {
  await db.query("DELETE FROM Artists WHERE artist_id = ?", [req.params.id]);
  res.json({ message: "Artist deleted" });
};
