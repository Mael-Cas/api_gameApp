const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
  try {
    const { email, password } = req.body;

    const permission = "user";
    
    // Hash the password
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const user = users[0];
    
    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT token
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
