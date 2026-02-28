# Netflix Style Auth App

Full-stack authentication app with React + Tailwind frontend and Node.js + Express + MySQL backend using JWT in HTTP-only cookies.

## Structure

- `client/` - React frontend
- `server/` - Express backend (MVC)

## 1) Backend setup

```bash
cd server
npm install
npm run dev
```

Create `.env` in `server/`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

DB_HOST=mysql-f89a566-nagaveninagashetty21-286a.i.aivencloud.com
DB_PORT=14638
DB_USER=avnadmin
DB_PASSWORD=replace_with_your_db_password
DB_NAME=defaultdb
DB_SSL=true
```

## 2) Frontend setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## Flow

1. User registers -> backend hashes password with bcrypt -> saves in MySQL -> returns success.
2. User logs in -> backend verifies password -> sets JWT HTTP-only cookie -> returns success.
3. Frontend redirects to `https://kodflix-flax.vercel.app/` after successful login.
