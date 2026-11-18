[Português](README.md) · **English**

# Library Management System

**Student:** Felipe de Almeida Bueno  
Web Back-End Programming — UTFPR, 2026-2 — Project 2.

An application for browsing the catalog and managing users, books, loans, and returns. Administrators manage records and the circulation of book copies. Regular users can browse books and view their own loan history. Both roles can search by title and author, view book details, and log out.

## Project presentation

[![Watch the project presentation](https://img.youtube.com/vi/XWJFRvbjuGs/hqdefault.jpg)](https://www.youtube.com/watch?v=XWJFRvbjuGs)

[Watch on YouTube](https://www.youtube.com/watch?v=XWJFRvbjuGs)

## Technologies and structure

Node.js 22.12 or later, PostgreSQL, Express 5.3, Sequelize 6.37, React 19.3, React Router 7.18, and Vite 8.3. The API also uses pg, jsonwebtoken, bcryptjs, cors, dotenv, and swagger-ui-express. Exact versions are recorded in the `package-lock.json` files.

- `backend/`: configuration, models, services, controllers, middleware, routes, and `openapi.json`.
- `frontend/`: React pages, reusable components, API requests, and custom CSS.
- `README.md`: installation, technical decisions, and tests.

## Installation and running

Requires Node.js with npm, a running PostgreSQL instance, and a desktop browser. The commands use PowerShell and start from the project directory.

1. In pgAdmin, connect to the `postgres` database and create the application database:

   ```sql
   CREATE DATABASE web2_projeto2_biblioteca;
   ```

2. Install the back-end dependencies and copy the configuration:

   ```powershell
   cd backend
   npm ci
   Copy-Item .env.example .env
   ```

   Edit `.env` with the PostgreSQL connection settings: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Set `JWT_SECRET` to a random secret with at least 32 characters. To generate one:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   `PORT` defaults to `8081`; `FRONTEND_ORIGIN` defaults to `http://localhost:5173`. Keep the secret only in the back-end environment.

3. Prepare the data and start the API:

   ```powershell
   npm run setup
   npm start
   ```

   The setup creates the tables and inserts any missing initial accounts and books. It can be run again without deleting data or resetting passwords.

4. In another terminal, start from the project root and prepare the front end:

   ```powershell
   cd frontend
   npm ci
   Copy-Item .env.example .env
   npm run dev
   ```

   `VITE_API_URL` defaults to `http://localhost:8081`. If you change the API port, update this variable and restart Vite. Vite uses port `5173`, which must be available. If you change the front-end origin, also update `FRONTEND_ORIGIN` in the API.

| Service | Local address |
| --- | --- |
| Interface | http://localhost:5173 |
| API | http://localhost:8081 |
| Swagger | http://localhost:8081/api-docs |

To build the interface, run `npm run build` in `frontend/`.

## Initial data

The following credentials are fictional and intended for demonstration:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@biblioteca.test | Admin123! |
| Regular user (Ana Souza) | usuario@biblioteca.test | Usuario123! |

The initial catalog contains Dom Casmurro (1 copy), O Cortiço (2), Capitães da Areia (1), and Entendendo Algoritmos (0), with no loans recorded.

## Technical decisions

- **Persistence:** PostgreSQL and Sequelize, covered in the course, represent the relationships between users, books, and loans and preserve data across API restarts.
- **Passwords:** bcryptjs generates and compares hashes with a cost factor of 12, without requiring a compiled native module. Validation limits passwords to 72 UTF-8 bytes to prevent truncation. No response contains the hash.
- **Authentication:** HS256 JWTs valid for 1 hour, sent through `Authorization: Bearer TOKEN`. On each protected request, the API checks the account's active status and current role in the database. CORS allows the configured origin and does not replace these checks.
- **Session:** `sessionStorage` keeps the token and user data for the lifetime of the tab's session, reducing persistence. It remains accessible to JavaScript and exposed to XSS. Logging out clears the local session; there is no blacklist, token renewal, or global revocation. A copied token remains valid until it expires, provided the account is still active. A 401 response prompts the user to log in again.
- **Books:** soft deletion (`ativo=false`) preserves history and removes the book from the catalog. Active loans prevent deletion. The ISBN remains reserved. Changing the total preserves the number of copies on loan; availability is calculated by the server.
- **Concurrency:** the loan and availability are updated in the same transaction, with a `FOR UPDATE` lock on the book row before checking stock. When two requests compete for the last copy, one completes and the other receives 409. Returns lock both the loan and the book; quantity updates and deletions also lock the book. A failure rolls back the entire transaction.
- **Dates:** loans and returns use the server timestamp. The expected return date is a valid `AAAA-MM-DD` date without a time component; past dates are accepted.

## Tests

Use a separate test database and run `npm run setup`. In Swagger or Postman, log in and use the token in **Authorize** or in the Bearer header.

1. Test login for both roles, incorrect credentials (401), a missing/invalid/expired token (401), and an administrative operation as a regular user (403).
2. Create, search for, view, edit, and delete books. Check invalid data (400), duplicate ISBNs (409), missing resources (404), and deletion with no response body (204).
3. Create and edit users, change a password, and deactivate an account. Confirm that it loses access, including with an already issued token, and that no response exposes hashes.
4. Lend a book with one copy: availability must fall to zero, and a second attempt must return 409. Record the return, check availability, and create another loan. A duplicate return must return 409.
5. With an active loan, try to delete the book or reduce the total below the number of copies on loan: both must return 409. After the return and deletion, the history must remain available.
6. Compare `/emprestimos` and `/emprestimos/meus`: administrators can view all loans; on the second route, each role sees only its own loans, even when another `usuarioId` is sent in the query.
7. Send two simultaneous loan requests for the last copy to different users. Expect one 201 and one 409, with availability at zero. Two simultaneous returns of the same loan must produce one 200 and one 409, returning only one copy to stock.
8. In the interface, go through all pages with both roles and check an empty search result, error/success messages, denied administrative access, logout, and a network failure with the API turned off. Also run `npm run build` in the front end.

## Limitations and scope

Runs locally in a desktop browser. The setup is intended for new installations and does not perform schema migrations. Token expiration and logout follow the behavior described above.

Optional features were not implemented: pagination, advanced filters, overdue indicators, and additional responsiveness/accessibility improvements. The required search by title and author is available.
