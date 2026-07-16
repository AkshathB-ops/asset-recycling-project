# Chain-of-Custody Ledger

A full-stack app for tracking IT assets through secure data wiping and recycling:
**intake → classify → sanitize → verify → certify → dispose**, with role-based
permissions and NIST SP 800-88 informed sanitization suggestions.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** React (Vite), React Router, Tailwind CSS

## Project layout

```
backend/
  config/db.js            MongoDB connection
  models/                 User, Asset (Mongoose schemas)
  middleware/auth.js       JWT verification + role guard
  controllers/             Request handlers (auth, assets)
  routes/                  Express routers
  utils/constants.js       Shared enums + NIST 800-88 suggestion engine
  utils/seed.js            One-time script to create the first admin
  server.js                App entry point

frontend/
  src/api/client.js         Fetch wrapper with auth header
  src/context/AuthContext.jsx  Login state, token storage
  src/components/           Reusable UI (stepper, certificate, forms, drawer)
  src/pages/                Login, Dashboard
```

## Roles

| Role          | Can do |
|---------------|--------|
| `admin`       | Everything, including managing user accounts |
| `intake_tech` | Log new assets, begin sanitization, mark disposed |
| `verifier`    | Verify sanitization, issue certificates, mark disposed |
| `auditor`     | Read-only access to everything |

Stage transitions are enforced **on the server** (`TRANSITION_ROLES` in
`backend/controllers/assetController.js`) — the frontend just hides buttons the
user isn't allowed to click; it never trusts the client for authorization.

## Setup

### 1. MongoDB

Run MongoDB locally (`mongod`) or use a hosted instance (e.g. MongoDB Atlas free tier).

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and SEED_ADMIN_PASSWORD
npm install
npm run seed     # creates the first admin account from your .env
npm run dev      # starts the API on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173, proxies /api to :4000
```

Open `http://localhost:5173`, sign in with the admin account you seeded, then
use the **Accounts** panel (top right) to create `intake_tech`, `verifier`,
and `auditor` users for the rest of your team.

## API summary

| Method | Path                        | Auth              | Purpose |
|--------|------------------------------|-------------------|---------|
| POST   | `/api/auth/login`            | —                 | Get a JWT |
| GET    | `/api/auth/me`                | any               | Current user |
| POST   | `/api/auth/users`             | admin             | Create account |
| GET    | `/api/auth/users`              | admin             | List accounts |
| GET    | `/api/assets`                  | any               | List/search/filter assets |
| GET    | `/api/assets/stats`            | any               | Dashboard counts |
| POST   | `/api/assets`                  | admin, intake_tech| Intake a new asset |
| GET    | `/api/assets/:id`               | any               | Asset detail + method suggestion |
| POST   | `/api/assets/:id/advance`       | role per stage    | Move to next pipeline stage |
| GET    | `/api/assets/:id/certificate`   | any               | Certificate of destruction data |
| DELETE | `/api/assets/:id`               | admin             | Remove an asset record |

## Notes on production hardening

This is a solid starting point, but before real deployment consider:
- HTTPS everywhere (JWTs in plaintext over HTTP are a real risk)
- Rate limiting on `/api/auth/login`
- Moving the JWT out of `localStorage` into an httpOnly cookie to reduce XSS exposure
- Structured audit log export (CSV/PDF) for compliance reviews
- Automated tests (the backend's clear controller/route separation makes this straightforward to add with something like Jest + Supertest)
