const db = require('../db');

exports.getAllGames = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM Games');
    res.json(rows);
};

exports.getGameById = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM Games WHERE Id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
};

exports.createGame = async (req, res) => {
    const { name, description, yearpublished } = req.body;
    const [result] = await db.query(
        'INSERT INTO Games (name, description, yearpublished) VALUES (?, ?, ?)',
        [name, description, yearpublished]
    );
    res.status(201).json({ id: result.insertId });
};

exports.updateGame = async (req, res) => {
    const { name, description, yearpublished } = req.body;
    await db.query(
        'UPDATE Games SET name = ?, description = ?, yearpublished = ? WHERE Id = ?',
        [name, description, yearpublished, req.params.id]
    );
    res.json({ message: 'Game updated' });
};

exports.deleteGame = async (req, res) => {
    await db.query('DELETE FROM Games WHERE Id = ?', [req.params.id]);
    res.json({ message: 'Game deleted' });
};
