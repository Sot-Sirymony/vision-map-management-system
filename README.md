# Vision Mapping Management System

Vision Mapping Management System helps users turn broad dreams into structured execution:

```text
Vision Area -> Dream -> Goal -> Step -> Task -> Partner/Resource -> Progress -> Review
```

The project currently includes a Spring Boot backend, React frontend, JWT authentication, PostgreSQL persistence, dashboard views, task board, partner/obstacle tracking, communication messages, reviews, and Excel export/import validation.

## Tech Stack

Backend:
- Java 17
- Spring Boot 3.5.3
- Maven
- Spring Web, Spring Data JPA, Spring Validation, Spring Security
- PostgreSQL for local/main database
- H2 for tests
- Flyway migrations
- Apache POI for Excel
- JJWT for authentication
- JUnit 5 and Mockito-ready test stack

Frontend:
- React 19.2.7
- React DOM 19.2.7
- Vite
- TypeScript
- React Router
- Fetch API
- Vitest and Testing Library

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE vision_mapping;
```

Connection settings are in `backend/src/main/resources/application.yml`. The database URL defaults to `jdbc:postgresql://localhost:5432/vision_mapping` and the username defaults to `postgres`, but the password has no default and must be set via environment variable before the backend will start:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD='your-password'
export JWT_SECRET='change-this-secret'
```

`DB_PASSWORD` is required — the app fails fast on startup if it isn't set. `JWT_SECRET` should also be overridden with a strong value for anything beyond local development.

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

Health check:

```text
GET http://localhost:8080/api/health
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Frontend runs on:

```text
http://127.0.0.1:5173/
```

## Demo Account

Mock data was inserted for:

```text
Email: demo.vision.mapping@example.com
Password: Password123
```

## Run Tests

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## API Summary

Public:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Protected:
- `/api/vision-areas`
- `/api/dreams`
- `/api/goals`
- `/api/steps`
- `/api/tasks`
- `/api/partners`
- `/api/communication-messages`
- `/api/reviews`
- `/api/obstacles`
- `/api/progress-logs`
- `/api/dashboard`
- `/api/excel/import`
- `/api/excel/export`

Protected endpoints require:

```text
Authorization: Bearer <token>
```

## Excel Import / Export

Export:
- Open `Import / Export`
- Click `Export workbook`
- The app downloads `vision-mapping-export-YYYY-MM-DD.xlsx`

Import:
- Open `Import / Export`
- Choose an `.xlsx` workbook
- Current implementation validates required sheet names and reports row counts.
- Import does not yet create database records.

Required sheets:
- Dashboard
- Vision Areas
- Dreams
- Goals
- Steps
- Tasks
- Partners
- Communication
- Reviews
- Obstacles
- Progress Logs
- Instructions

## Known Limitations

- Excel import validates workbook structure but does not yet persist rows.
- Tests cover key flows but are not exhaustive.

## Future Improvements

- Full Excel row-to-database import.
- Richer dashboard charts.
- More backend business-rule unit tests.
- Frontend tests for forms and API error states.


https://claude.ai/code/artifact/199cd8cd-8af3-4bd9-b68f-9c2d414def2f?via=auto_preview


** Fixing
DATA-1