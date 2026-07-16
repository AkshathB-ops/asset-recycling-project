const express = require("express");
const { login, me, createUser, listUsers } = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

// Only admins can provision new accounts — run `npm run seed` once to create the first admin.
router.post("/users", requireAuth, requireRole("admin"), asyncHandler(createUser));
router.get("/users", requireAuth, requireRole("admin"), asyncHandler(listUsers));

module.exports = router;
