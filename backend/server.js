require("dotenv").config();
const express = require("express"); 
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");

const app = express();
app.set("trust proxy", 1); // trust first proxy (needed for secure cookies when behind a reverse proxy)
app.use(cors());
app.use(express.json());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Central error handler — catches anything thrown/rejected in controllers.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });
