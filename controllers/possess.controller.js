const db = require("../db");

exports.getAllGameUsers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Users");
  res.json(rows);
};

exports.getUsersByGameId = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Game_Users WHERE Id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows);
};

exports.createGameUser = async (req, res) => {
  const { Id, user_id } = req.body;
  const [result] = await db.query(
    "INSERT INTO Game_Users (Id, user_id) VALUES (?, ?)",
    [Id, user_id]
  );
  res.status(201).json({ id: result.insertId });
};

exports.deleteGameUser = async (req, res) => {
  const { Id, user_id } = req.body;
  await db.query("DELETE FROM Game_Users WHERE Id = ? AND user_id = ?", [
    Id,
    user_id,
  ]);
  res.json({ message: "GameUser deleted" });
};

exports.swipeGame = async (req, res) => {
  const  gameId = req.params;
  const userId = req.auth.userId;
  const { swipe } = req.body; // doit être 1 (like) ou -1 (dislike)

  // Validation rapide
  if (![1, -1].includes(swipe)) {
    return res.status(400).json({ message: "Swipe must be 1 (like) or -1 (dislike)" });
  }

  try {
    const [result] = await db.query("CALL swipe_game(?, ?, ?)", [
      userId,
      gameId,
      swipe,
    ]);

    res.status(200).json({
      message: "Swipe enregistré avec succès",
      info: result[0] || null, // SELECT dans la proc : ligne 'info'
    });
  } catch (error) {
    console.error("❌ Error in swipeGame:", error);
    res.status(500).json({ error: "Erreur lors du swipe du jeu" });
  }
};
