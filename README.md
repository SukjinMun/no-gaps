# No Gaps

Two private timelines: one for your past addresses and one for your past jobs and schools,
each with a check that flags the months you haven't recorded.

![Jobs & Schools page showing the 10-year timeline, the gap check and the list](docs/screenshot.gif)

![Addresses page showing the 5-year gap check and the timeline](docs/addresses.png)

## Authors

- **Alejandra Aimee Rivas Montes**: Jobs & Schools timeline (activities collection, page, routes,
  gap check, seed), registration and the users seed.
- **Suk Jin Mun**: Address timeline (addresses collection, page, routes, seed).

Each partner wrote the full stack of their own part. Before the code freeze Suk also made a few
small fixes in Alejandra's files in pull requests #6 and #7. He removed two unused imports and a
leftover `console.log`. He added a `name` attribute to the form inputs and alt text to the logo.
He gave the login form its own CSS rules and fixed the hover color of the brand link.

## Class

[CS5610 Web Development](https://johnguerra.co/classes/webDevelopment_online_fall_2026/)

## Objective

Rental applications and green card forms ask for every address you lived at in the last few
years. Background checks ask for every job and school of the last 7 to 10 years, with no
unexplained gaps. No Gaps keeps both histories in one private place, so you never have to
rebuild them from old emails and leases again.

- Each user logs in and sees only their own entries.
- **Addresses** checks the last 5 years. Unrecorded months are listed as gaps and months with two
  addresses are listed as overlaps. A move inside one month is not an overlap.
- **Jobs & Schools** checks the last 10 years. Each month is covered (job or school),
  explained (an "other activity" such as caregiving or travel) or unrecorded. Unrecorded months
  are listed as gaps, and one click starts an entry that fills them.
- Working and studying at the same time is normal and is never flagged.

The app organizes what you enter; it doesn't verify it.

## Demo

- Deployed app: [no-gaps.onrender.com](https://no-gaps.onrender.com)
- Video: [YouTube](https://youtu.be/9in8LgxNYj0)
- Design document: [docs/DESIGN.pdf](docs/DESIGN.pdf) (PDF) and [docs/DESIGN.md](docs/DESIGN.md) (the same text as a GitHub page)
- Slides: [Google Slides](https://docs.google.com/presentation/d/1r8hK2WlgtJ56rmtv6cy-PEECMXk2hrNlZG-sYHmKLh0/edit?usp=sharing)

Demo accounts (password `nogaps-demo`):

| Account          | Jobs & Schools                                                                                                      | Addresses                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `demo.gaps`      | A gap at the start of the 10-year range (3 months in November 2026), a 3-month gap and an 18-month explained period | A 3-month gap and a 2-month overlap |
| `demo.complete`  | No gaps; school and a part-time job overlap                                                                         | No gaps and no overlaps             |
| `demo.explained` | A break covered by an explained period                                                                              | No gaps and a 3-month overlap       |
| `demo.empty`     | An empty history                                                                                                    | An empty history                    |

## Tech stack

- Frontend: React 18 with hooks, React Router and Vite, using `fetch`. The address pages use
  React Bootstrap components.
- Backend: Node.js and Express (ES modules) with the native MongoDB driver.
- Login: Passport (passport-local) with express-session; sessions are stored in MongoDB and
  passwords are hashed with bcrypt.
- Sessions: `connect-mongo` is the session store of express-session. It keeps the sessions in
  MongoDB so a restart of the server does not log the users out. The data of the app goes only
  through the native driver.
- No Mongoose, axios or CORS package.

## Build and run

Requirements: Node.js 20.6 or newer and a MongoDB database (local or
[MongoDB Atlas](https://www.mongodb.com/atlas)).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # then set MONGO_URI and SESSION_SECRET
npm run seed           # demo accounts, 200 synthetic users, 1,200+ activities, 1,000+ addresses
npm run dev            # API on http://localhost:3000

# 2. Frontend (second terminal)
cd frontend
npm install
npm run dev            # app on http://localhost:5173 (sends /api to the backend)
```

Production build: run `npm run build` in `frontend`. On the host, set `MONGO_URI`, `DB_NAME`,
`SESSION_SECRET` and `NODE_ENV=production` as environment variables and run `npm start` in
`backend`. Express serves the built app from `frontend/dist`.

Other scripts (both folders): `npm run lint` (ESLint) and `npm run format` (Prettier).
`npm test` in `backend` runs the tests with Node's built-in test runner.

## Project structure

```
backend/
  auth/          Passport setup and the login check
  controllers/   route handlers (activities, register)
  db/            MongoDB connection and one file per collection
  middleware/    the login check for protected routes
  routes/        Express routers
  seed/          synthetic data scripts
  utils/         gap check, validation, month helpers
  tests/
frontend/src/
  api/           fetch helpers
  assets/        the logo
  components/    one component per file, each with its own CSS file
  pages/
  utils/
```

## API

All `/api/activities` and `/api/addresses` routes need a logged-in session and only touch that
user's entries.

| Method | Route                           | Does                                                                                                                                                                                                       |
| ------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/register`                 | Create an account                                                                                                                                                                                          |
| POST   | `/api/login`                    | Log in                                                                                                                                                                                                     |
| POST   | `/api/logout`                   | Log out                                                                                                                                                                                                    |
| GET    | `/api/me`                       | Who is logged in                                                                                                                                                                                           |
| GET    | `/api/activities`               | List my jobs, schools and other activities                                                                                                                                                                 |
| GET    | `/api/activities/gaps?years=10` | Covered, explained and unrecorded months, the list of gaps, and a `timeline` of segments (each with its months and the ids of the activities that cover it; no ids means a gap). `years` can be 5, 7 or 10 |
| POST   | `/api/activities`               | Add one                                                                                                                                                                                                    |
| PUT    | `/api/activities/:id`           | Edit one of mine                                                                                                                                                                                           |
| DELETE | `/api/activities/:id`           | Delete one of mine                                                                                                                                                                                         |
| GET    | `/api/addresses?q=`             | List my addresses with the 5-year check of gaps and overlaps. `q` filters the list by street, city or landlord                                                                                             |
| GET    | `/api/addresses/:id`            | Read one of mine                                                                                                                                                                                           |
| POST   | `/api/addresses`                | Add one                                                                                                                                                                                                    |
| PUT    | `/api/addresses/:id`            | Edit one of mine                                                                                                                                                                                           |
| DELETE | `/api/addresses/:id`            | Delete one of mine                                                                                                                                                                                         |

## Rubric

Where each rubric item is in this repository.

| Rubric item                                   | Where                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Design document                               | [docs/DESIGN.pdf](docs/DESIGN.pdf) has the project description, the user personas, the user stories and the design mockups. [docs/DESIGN.md](docs/DESIGN.md) is the same text  |
| Requirements approved in #project             | [Objective](#objective)                                                                                                                                                        |
| Is the app actually useful                    | [Objective](#objective) names the forms that ask for these histories                                                                                                           |
| Instructions on how to use the app            | "How to use this page" on the Addresses page and on the Jobs & Schools page                                                                                                    |
| ESLint config file                            | `backend/eslint.config.js` and `frontend/eslint.config.js`, run with `npm run lint`                                                                                            |
| Code organization                             | [Project structure](#project-structure)                                                                                                                                        |
| At least 3 React components (using hooks)     | `frontend/src/components` and `frontend/src/pages`                                                                                                                             |
| Each React component in its own file          | One `.jsx` file per component in those two folders, plus `frontend/src/App.jsx`                                                                                                |
| Deployed on a public server                   | [Demo](#demo)                                                                                                                                                                  |
| 2 Mongo collections with CRUD                 | `activities` by Alejandra (`backend/routes/activities.js`, `backend/db/activitiesDB.js`) and `addresses` by Suk (`backend/routes/Addresses.js`, `backend/db/MyDBAddresses.js`) |
| 1k synthetic records                          | `npm run seed` adds 1,200+ activities and 1,000+ addresses (`backend/seed`)                                                                                                    |
| Node + Express                                | `backend/server.js` and `backend/app.js`                                                                                                                                       |
| Prettier                                      | `.prettierrc.json`, run with `npm run format`                                                                                                                                  |
| Standard HTML elements                        | Real `button`, `a`, `form`, `label` and `input` elements                                                                                                                       |
| CSS organized by components                   | Each component imports the CSS file with its own name                                                                                                                          |
| README                                        | Authors, class link, objective and screenshots above, instructions in [Build and run](#build-and-run)                                                                          |
| No exposed credentials                        | `backend/.env.example` has no secret and `.env` is in `.gitignore`                                                                                                             |
| package.json for the backend and the frontend | `backend/package.json` and `frontend/package.json`                                                                                                                             |
| MIT license                                   | [LICENSE](LICENSE)                                                                                                                                                             |
| No leftover code                              | Every source file is imported by another file or run by an npm script                                                                                                          |
| Video                                         | [Demo](#demo)                                                                                                                                                                  |
| Code frozen on time                           | [Code freeze](#code-freeze)                                                                                                                                                    |
| PropTypes                                     | The `propTypes` block of each component file                                                                                                                                   |
| No axios, Mongoose or CORS                    | The dependencies in the two `package.json` files                                                                                                                               |
| Authentication using Passport                 | `backend/auth/passport.js` and `backend/routes/auth.js`                                                                                                                        |

## License

[MIT](LICENSE)

## Code freeze

Suk Jin Mun's last code commit before the code freeze on 2026.11.17 at 2:59 am ET is 2289b35.
Alejandra Aimee Rivas Montes's last code commit before the code freeze on 2026.11.17 at 2:59 am ET is 3815e47.

The commits after the code freeze change only `README.md` and files in `docs/`. The folders
`backend` and `frontend` are the same as in 2289b35.
