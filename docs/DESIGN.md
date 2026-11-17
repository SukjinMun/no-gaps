# No Gaps: Design Document

CS5610 Web Development, Northeastern University, Fall 2026.
Authors: Alejandra Aimee Rivas Montes and Suk Jin Mun.

## 1. Project description

Rental applications, green card forms and background checks ask for a full history: every
address you lived at, and every job and school of the last 7 to 10 years, with no unexplained
gaps. People rebuild that history from old emails, leases and pay stubs every time they fill in
a new form.

No Gaps keeps two private histories in one place:

- **Addresses** (Suk): past homes with their dates.
- **Jobs & Schools** (Alejandra): past jobs, schools and "other" periods such as caregiving or
  travel, with dates and an optional supervisor or contact.

Each history marks the months that have no record. The app organizes what the user enters; it
does not verify anything.

Each history works and is graded on its own. The Jobs & Schools part never reads the addresses
collection, and the other way around.

| Part of this document | Author |
| --- | --- |
| Personas Marcus and Grace, the Jobs & Schools stories and rules, the `users` and `activities` data, the activities API, the Jobs & Schools page, wireframes 01 to 04, login and registration | Alejandra |
| Personas Dana and Minh, the address stories and rules, the `addresses` data, the addresses API, the Addresses page, wireframes 05 and 06 | Suk |

## 2. User personas

### Marcus, new hire

- Just accepted a job offer at a company that runs a background check.
- The check asks for 7 years of jobs and schools, with a supervisor for each job.
- Has changed jobs three times and studied part-time; doesn't remember the exact months.
- Wants to write everything down once and copy it into the form.

### Grace, federal job applicant

- Applying for a federal position.
- Her form asks for 10 years of history with no unexplained gaps.
- Took a break to care for a family member and spent some months between jobs.
- Wants to see at a glance which months are missing before she submits.

### Dana, renter

- Applying for a new apartment.
- Each application asks for every past address with the landlord's name and phone.
- Has to dig through old leases to find them.
- Wants to write each address down once with its landlord contact.

### Minh, international graduate

- Preparing a green card form.
- The form asks for every address of the last five years.
- Moved six times and does not remember the exact months.
- Wants to see which months are missing or doubled before the form goes out.

## 3. User stories

### Jobs & Schools (Alejandra)

1. As Marcus, I want to add each job and school with its dates and supervisor, so I have
   everything the background check asks for in one place.
2. As Grace, I want to see my last 10 years with the missing months marked, so I can fill or
   explain them before I submit my form.
3. As Marcus, I want to edit or delete a job or school, so my history stays correct when I find
   the real dates.

Supporting stories:

- As a new user, I want to create an account and log in, so only I can see my history.
- As Grace, I want to explain a break (for example, caregiving) so those months don't show up as
  missing.
- As Grace, I want to click a missing period and start an entry with its dates already filled in
  so I do not type them again.

### Addresses (Suk)

1. As Dana, I want to add each past address with its dates and landlord contact so I can stop
   digging through old leases.
2. As Minh, I want to see my last five years of addresses with missing months and overlaps
   flagged so I can complete my form.
3. As Minh, I want to edit or delete an address so I can fix a wrong date before it goes on an
   official form.

Supporting stories:

- As Minh, I want to click a missing period and start an address with its months already filled
  in so I do not type them again.
- As Dana, I want to filter my addresses by street or landlord so I can find one lease fast.

## 4. Gap rules

These rules were agreed by both authors and apply to both histories.

- Dates have month precision, in `YYYY-MM` format. The start and end months both count as
  covered.
- A record marked as current (`isCurrent: true` in activities, `current: true` in addresses)
  runs to the current month and has no end month.
- Consecutive unrecorded months form a gap.
- A gap is shown as "months unrecorded", never as an error or a failure.

### Jobs & Schools rules

- The checked range is the last 10 years, including the current month. The API also accepts 5
  or 7 years.
- Each month in the range is **covered** (a job or school), **explained** (only an "other"
  activity) or **unrecorded**.
- Overlaps are normal (working and studying at the same time) and are never flagged.

### Address rules

- The checked range is the last 5 years, including the current month.
- Each month in the range is **covered** (at least one address) or **unrecorded**.
- Two addresses overlap when the later one starts before the earlier one ends. An overlap is
  listed with its months and both streets so the user can fix a wrong date.
- A move inside one month is not an overlap. The old address ends and the new address starts in
  that same month.

## 5. Data model

MongoDB with the native driver (no Mongoose). Every activity and every address belongs to
one user, and every query filters by that user's id.

### `users`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `username` | string | Unique index |
| `passwordHash` | string | bcrypt hash; never sent to the browser |
| `createdAt` | Date | |
| `seed` | boolean | Only on seeded accounts |

### `activities`

| Field | Type | work | school | other |
| --- | --- | --- | --- | --- |
| `userId` | ObjectId | from the session | same | same |
| `type` | `"work"`, `"school"` or `"other"` | | | |
| `organization` | string | required | required | optional |
| `title` | string | position | program | explanation |
| `startMonth` | `YYYY-MM` | required | required | required |
| `endMonth` | `YYYY-MM` or null | required unless current | same | same |
| `isCurrent` | boolean | | | |
| `contact` | `{ name, role, phone, email }` | optional | optional | optional |
| `notes` | string | optional | optional | optional |
| `createdAt`, `updatedAt` | Date | | | |

The end month can't be before the start month. Several current records are allowed at once.
Index: `{ userId: 1, startMonth: 1 }`.

### `addresses`

| Field | Type | Notes |
| --- | --- | --- |
| `userId` | ObjectId | From the session |
| `street` | string | Required |
| `unit` | string | Optional |
| `city` | string | Required |
| `state` | string | Optional |
| `zip` | string | Optional |
| `country` | string | Required. The form starts with United States |
| `startMonth` | `YYYY-MM` | Required |
| `endMonth` | `YYYY-MM` or null | Required unless current |
| `current` | boolean | True for the address the user lives at now |
| `landlordName`, `landlordPhone`, `landlordEmail` | string | Optional |
| `notes` | string | Optional |
| `createdAt`, `updatedAt` | Date | |
| `seeded` | boolean | Only on seeded addresses |

The end month can't be before the start month. A text field holds at most 200 characters and
the notes hold at most 1,000. The seed creates the index `{ userId: 1, startMonth: -1 }`.

## 6. Architecture

![No Gaps architecture: React frontend, Express backend with Passport and sessions, and MongoDB](architecture.svg)

- In development, Vite forwards `/api` to the backend, so no CORS package is needed.
- In production, Express serves the built React app from `frontend/dist`.
- The server is the only source of the gap check. After each save or delete, the page asks
  the server for the list and the gap summary again instead of computing gaps in the browser.

### API

All `/api/activities` and `/api/addresses` routes need a session and only touch the logged-in
user's records.

| Method | Route | Does |
| --- | --- | --- |
| POST | `/api/register` | Create an account (409 if the username is taken) |
| POST | `/api/login` | Log in |
| POST | `/api/logout` | Log out |
| GET | `/api/me` | Who is logged in (401 if nobody) |
| GET | `/api/activities` | List my activities, newest first |
| GET | `/api/activities/gaps?years=10` | Month counts, gaps and timeline segments |
| POST | `/api/activities` | Add one (201, or 400 with `{ errors }`) |
| PUT | `/api/activities/:id` | Edit one of mine (404 if it isn't mine) |
| DELETE | `/api/activities/:id` | Delete one of mine (204, or 404) |
| GET | `/api/addresses?q=` | List my addresses, newest first, with the gap and overlap check. `q` filters the list by street, city or landlord |
| GET | `/api/addresses/:id` | Read one of mine (404 if it isn't mine) |
| POST | `/api/addresses` | Add one (201, or 400 with `{ error, errors }`) |
| PUT | `/api/addresses/:id` | Edit one of mine (404 if it isn't mine) |
| DELETE | `/api/addresses/:id` | Delete one of mine (200, or 404) |

The gaps response (shortened; `coveredMonths` includes the explained months):

```json
{
  "range": { "start": "2016-12", "end": "2026-11", "years": 10 },
  "totalMonths": 120,
  "coveredMonths": 114,
  "explainedMonths": 18,
  "unrecordedMonths": 6,
  "gaps": [{ "start": "2019-03", "end": "2019-05", "months": 3 }],
  "timeline": [
    { "start": "2016-12", "end": "2019-02", "months": 27, "activityIds": ["..."] },
    { "start": "2019-03", "end": "2019-05", "months": 3, "activityIds": [] }
  ]
}
```

`timeline` splits the range into consecutive segments that share the same activities. A
segment with no ids is a gap.

The addresses response is below in a short form. The check always covers every address of the
user, so a filter changes only the list.

```json
{
  "addresses": [{ "_id": "...", "street": "1420 Alder St", "current": true }],
  "total": 4,
  "check": {
    "years": 5,
    "from": "2021-12",
    "to": "2026-11",
    "totalMonths": 60,
    "coveredMonths": 57,
    "gaps": [{ "from": "2023-10", "to": "2023-12", "months": 3 }],
    "overlaps": [
      {
        "from": "2022-03",
        "to": "2022-04",
        "months": 2,
        "addresses": [
          { "_id": "...", "street": "300 Cedar Blvd" },
          { "_id": "...", "street": "9 Birch Ct" }
        ]
      }
    ],
    "overlapMonths": 2
  }
}
```

## 7. Interface design

### Jobs & Schools page, top to bottom

1. **Header**: logo, "No Gaps", navigation and "Log out".
2. **Title** and the "+ Add activity" button.
3. **"Your last 10 years" timeline**: a horizontal bar of the whole range.
   - Each segment's width is proportional to its months, with a 12 px minimum so a one-month
     gap stays visible.
   - Colors match the activity type. Overlapping types are shown as a gradient. Gaps use the
     yellow from the logo.
   - Hovering shows the period and the activities (or "N months unrecorded").
   - Clicking a gap opens the form with its dates filled in. Clicking an activity scrolls to
     it in the list and highlights it.
4. **"How to use this page"**: a collapsible help section.
5. **Gap check**: months covered, number of gaps, months explained, a progress bar of the
   recorded share with the recorded and unrecorded percentages below it, and the list of gaps
   with an "Add activity for these months" button.
6. **Form** (when open): add or edit an activity.
7. **Timeline list**: every activity, newest first, with Edit and Delete (Delete asks to
   confirm).
8. **Footer**: "No Gaps · Mind the gap. We already did." and "Made by Ale & Suk".

Screenshot of the built page: [screenshot.gif](screenshot.gif).

### Addresses page, top to bottom

1. **Header.** The same header as on every page, with Addresses marked as the current page.
2. **Title** and the "+ Add address" button.
3. **"How to use this page".** A collapsible help section with four steps.
4. **Gap check.** The months covered and the counts of gaps and overlaps for the last 5 years. A
   progress bar shows the covered share. Each gap has an "Add address for these months" button.
   Each overlap names its months and both streets. A gap row is yellow and an overlap row is red.
5. **Filter.** When the user has at least one address, a search box above the list narrows it by
   street, city or landlord. The gap check stays complete. The dashed gap rows of the list are
   hidden while a filter is active.
6. **Timeline list.** Every address with Edit and Delete in newest-first order. Delete asks to
   confirm. A gap shows as a dashed row between the two addresses around it. An address in an
   overlap carries an "Overlap" badge.
7. **Footer.** The same footer as on every page.

The form to add or edit an address has its own page (`/addresses/new` and
`/addresses/:id/edit`), so a gap row can link to a form with its months filled in.

The screenshot [addresses.png](addresses.png) shows the Addresses page.

### Design mockups

Low-fidelity wireframes drawn before building the Jobs & Schools timeline. The numbered notes
on each one explain the design decisions. Wireframes 01 to 04 are those drawings. Wireframes 05
and 06 show the two address pages.

#### Wireframe 01: Log in and create account

![Wireframe 01: log in and create account forms](mockups/01-login-register.png)

1. **One simple form.** Only username and password. Errors appear above the form.
2. **Easy switch.** A link goes between log in and create account.
3. **Password rules.** The rule (at least 8 characters) shows before the user types. The
   server hashes the password with bcrypt.
4. **Private.** Every page except these two needs a session.

#### Wireframe 02: Jobs & Schools timeline

![Wireframe 02: Jobs & Schools page with the 10-year bar and the list](mockups/02-activities-timeline.png)

1. **Add button.** Always visible at the top of the page.
2. **10-year bar.** The history is drawn as one bar so gaps (hatched) stand out. Overlaps go on
   a second row.
3. **List, newest first.** Gaps sit between entries with a button to fill them.
4. **Open question.** Bar or summary numbers? To be tested with users.

#### Wireframe 03: Add or edit an activity

![Wireframe 03: activity form with type, dates and contact](mockups/03-activity-form.png)

1. **Type first.** Work, school or other. The labels below change with the type.
2. **Month and year only.** Errors show right under the field. "I still do this" hides the end
   date.
3. **Contact.** Supervisor, school office or reference. Never required.

#### Wireframe 04: Phone layout

![Wireframe 04: phone layout with the summary at the top](mockups/04-phone-layout.png)

1. **Summary first.** The 10-year bar and the gap count stay at the top.
2. **Big touch targets.** Buttons are at least 44 px; the add button spans the full width.
3. **Menu.** Links collapse into a ≡ menu on small screens.

#### Wireframe 05: Addresses timeline

![Wireframe 05: Addresses page with the gap check and the list](mockups/05-addresses-timeline.png)

1. **Add button.** Always at the top of the page.
2. **Gap check first.** The numbers and the missing months come before the list.
3. **Overlaps.** Two addresses in the same months get one row with both streets.
4. **Filter.** Street, city or landlord. The gap check does not change.
5. **List, newest first.** A gap sits between the two addresses around it with a link to fill it.

#### Wireframe 06: Add or edit an address

![Wireframe 06: address form with the address, the months and the landlord](mockups/06-address-form.png)

1. **Address first.** Street and city are required. Unit, state and ZIP are optional.
2. **Month and year only.** The error shows right under the field. "I live here now" switches off
   the end month.
3. **Landlord.** Name, phone and email for a rental form. Never required.

### From mockups to the built app

- **Bar and numbers.** The open question in wireframe 02 was settled by keeping both: the
  "Your last 10 years" timeline at the top, and the "Gap check" card with the numbers below it.
- **Overlaps.** Instead of a second row, overlapping types share one segment drawn as a
  gradient of their colors.
- **Color.** The grey wireframe bar became colors per type (work, school, other), with gaps in
  the logo's yellow instead of hatching.
- **Gaps.** Gaps are listed in the Gap check card with an "Add activity for these months"
  button, and can also be filled by clicking them on the timeline, instead of sitting between
  entries in the list.
- **Menu.** The header links wrap onto a second line on small screens instead of collapsing
  into a ≡ menu.
- **Address gap check.** Wireframe 05 drew the gap inside a 5-year bar with a "Fill this gap"
  button. The app shows a progress bar of the covered months, and each gap row has an "Add
  address for these months" button.
- **Address form.** The country is required as well as the street and the city, and the form
  starts with United States.

### Colors

| Use | Color |
| --- | --- |
| Header and footer background | `#1E293B` |
| Header and footer main text | `#FFFFFF` |
| Header and footer secondary text | `#CBD5E1` |
| Work | `#0B5ED7` |
| School | `#198754` |
| Other (explained) | `#0AA2C0` |
| Gap (months unrecorded) | `#FFD966` |
| Overlap (months at two addresses) | `#F8D7DA` |

The colors of this table are CSS variables in `frontend/src/index.css`.

### Accessibility

- Semantic HTML: `<button>`, `<form>`, `<label htmlFor>`, `<nav>`, `<header>`, `<footer>`.
  No `div` or `span` with an onClick.
- Form-level messages use `role="alert"`, and each field error appears right under its field.
- Touch targets are at least 44 px. The layout works at 390 px wide.
- Every timeline segment is a button with a full `aria-label`. The gap list below the
  timeline offers the same actions with larger targets.
- In the address form each error is tied to its field with `aria-describedby`. Edit and Delete
  name their address in an `aria-label`.

## 8. Security and privacy

- Passwords are hashed with bcrypt. `passwordHash` is never returned to the browser.
- Sessions are stored in MongoDB. The cookie is `httpOnly` and `sameSite=lax`, and `secure` in
  production.
- `userId` always comes from the session (`req.user._id`), never from the request body.
  Validation drops any `userId` the browser sends.
- Every activity query and every address query filters by `userId`. Editing or deleting someone
  else's record returns 404.
- Credentials live in `backend/.env`, which is not committed.

## 9. Testing and seed data

- Tests use Node's built-in runner (`npm test` in `backend`) with fake in-memory data layers.
  They cover the gap rules, the timeline segments, validation, privacy, registration, login and
  the seed.
- `npm run seed` creates 4 demo accounts, 200 synthetic users and more than 1,000 activities.
  It can be run again without duplicating data.
- The 31 address tests cover the 5-year check and the rules of one address. They include the
  move month and gaps at both ends of the range. They also cover overlaps and each field rule.
- The address seed gives each synthetic user 5 to 8 addresses. That is more than 1,000 in total.
  Some histories have gaps and overlaps on purpose.

Demo accounts (password `nogaps-demo`):

| Account | Jobs & Schools | Addresses |
| --- | --- | --- |
| `demo.gaps` | A gap at the start of the range (3 months in November 2026), a 3-month gap and 18 explained months | A 3-month gap and a 2-month overlap |
| `demo.complete` | No gaps; school and a part-time job overlap | No gaps and no overlaps |
| `demo.explained` | A break covered by an explained period | No gaps and a 3-month overlap |
| `demo.empty` | An empty history | An empty history |

## 10. Tech stack

- Frontend: React 18 with hooks, React Router 6, Vite 5, `fetch`, PropTypes, custom CSS. The
  address pages use React Bootstrap 2 with Bootstrap 5 for their buttons, form controls, alerts
  and badges.
- Backend: Node.js 20.6+, Express 4, native MongoDB driver 6.
- Login: Passport (passport-local), express-session, connect-mongo, bcrypt.
- Tooling: ESLint and Prettier.
- Not used, by design: Mongoose, axios, the `cors` package, Next.js.
