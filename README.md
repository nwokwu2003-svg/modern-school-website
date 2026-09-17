# Chibest Excellence Academy — Full-stack version

This package adds a Node.js/Express + MySQL backend to the responsive school website.

## What is included
- Responsive frontend from the corrected version.
- Same `./imageschool/...` image source paths; no image paths were changed.
- Public REST API for admission inquiries, contact messages, statistics, programs and gallery.
- MySQL database schema.
- JWT-protected admin API.
- Simple `/admin` dashboard for viewing inquiries/messages and their statuses.
- Student records API for future student management.
- Security middleware (Helmet), CORS, JSON validation and parameterized SQL queries.

## 1. Requirements
- Node.js 18+
- MySQL 8+

## 2. Install
```bash
npm install
```

## 3. Configure environment
Copy `.env.example` to `.env` and set your MySQL credentials and a strong `JWT_SECRET`.

You can also set:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

## 4. Create the database
Run `backend/sql/schema.sql` in MySQL.

Example:
```bash
mysql -u root -p < backend/sql/schema.sql
```

## 5. Create the first admin
```bash
node backend/seed-admin.js
```
Do not use the default password in production.

## 6. Start the website + API
```bash
npm start
```
Open:
- Website: `http://localhost:5000`
- Admin: `http://localhost:5000/admin`
- API health: `http://localhost:5000/api/health`

## Main API endpoints
### Public
- `POST /api/inquiries`
- `POST /api/contact`
- `GET /api/stats`
- `GET /api/programs`
- `GET /api/gallery`

### Admin (Bearer JWT required)
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/inquiries`
- `PATCH /api/admin/inquiries/:id/status`
- `GET /api/admin/messages`
- `PATCH /api/admin/messages/:id/status`
- `GET /api/admin/students`
- `POST /api/admin/students`
- `PATCH /api/admin/stats`

## Frontend integration
The admission inquiry and contact forms now send real POST requests to the backend instead of only showing an alert. The backend stores submissions in MySQL.
