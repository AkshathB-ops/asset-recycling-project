const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT on the Authorization header and attaches req.user (safe fields only).
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return res.status(401).json({ error: "Invalid or inactive account." });

    req.user = { id: user._id.toString(), name: user.name, username: user.username, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Restricts a route to a specific set of roles, e.g. requireRole("admin", "verifier").
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated." });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `This action requires one of these roles: ${allowedRoles.join(", ")}.` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
