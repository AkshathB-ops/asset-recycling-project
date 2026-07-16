const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ROLES } = require("../utils/constants");

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });

  const user = await User.findOne({ username: username.toLowerCase().trim() });
  if (!user || !user.active) return res.status(401).json({ error: "Incorrect username or password." });

  const valid = await user.checkPassword(password);
  if (!valid) return res.status(401).json({ error: "Incorrect username or password." });

  const token = signToken(user);
  res.json({ token, user: user.toSafeJSON() });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: user.toSafeJSON() });
}

// POST /api/auth/users  (admin-only user creation — see routes/authRoutes.js)
async function createUser(req, res) {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: "username, password, name, and role are all required." });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: `role must be one of: ${ROLES.join(", ")}` });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const existing = await User.findOne({ username: username.toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: "That username is already taken." });

  const user = new User({ username: username.toLowerCase().trim(), name, role });
  await user.setPassword(password);
  await user.save();

  res.status(201).json({ user: user.toSafeJSON() });
}

// GET /api/auth/users (admin-only list, for assigning/reviewing accounts)
async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((u) => u.toSafeJSON()) });
}

module.exports = { login, me, createUser, listUsers };
