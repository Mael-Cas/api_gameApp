/**
 * Contrôleur des utilisateurs
 * Fournit les fonctions pour gérer les utilisateurs (CRUD, login, etc.)
 * Utilise la base de données via le module db
 */
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Récupère tous les utilisateurs.
 * @param {Request} req
 * @param {Response} res
 */
exports.getAllUsers = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Users");
  res.json(rows);
};

/**
 * Récupère un utilisateur par son ID (depuis le token).
 * @param {Request} req
 * @param {Response} res
 */
exports.getUserById = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Users WHERE user_id = ?", [
    req.user.userId,
  ]);
  if (rows.length === 0) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

/**
 * Crée un nouvel utilisateur avec un mot de passe hashé.
 * @param {Request} req
 * @param {Response} res
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const permission = "user";
    
    // Génération du hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(
      "INSERT INTO Users (email, password, permission) VALUES (?, ?, ?)",
      [email, hashedPassword, permission]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

/**
 * Met à jour un utilisateur existant (email, permission, mot de passe).
 * @param {Request} req
 * @param {Response} res
 */
exports.updateUser = async (req, res) => {
  try {
    const { email, password, permission } = req.body;
    const userId = req.params.id;

    // Vérifier que l'utilisateur existe
    const [existingUser] = await db.query("SELECT * FROM Users WHERE user_id = ?", [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let updateValues = [email, permission];
    let updateQuery = "UPDATE Users SET email = ?, permission = ?";

    if (password) {
      // Si un nouveau mot de passe est fourni, le hasher
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateValues.push(hashedPassword);
      updateQuery += ", password = ?";
    }

    updateValues.push(userId);
    updateQuery += " WHERE user_id = ?";

    await db.query(updateQuery, updateValues);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

/**
 * Supprime un utilisateur par son ID.
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteUser = async (req, res) => {
  await db.query("DELETE FROM Users WHERE user_id = ?", [req.params.id]);
  res.json({ message: "User deleted" });
};

/**
 * Authentifie un utilisateur et retourne un token JWT.
 * @param {Request} req
 * @param {Response} res
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Recherche de l'utilisateur par email
    const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = users[0];
    
    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, permission: user.permission },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        permission: user.permission
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error.message });
  }
};
