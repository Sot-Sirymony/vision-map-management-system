# API Reference

Base URL:

```text
http://localhost:8080/api
```

Protected endpoints require:

```text
Authorization: Bearer <token>
```

## Public

### Health

```text
GET /health
```

Response:

```json
{
  "status": "UP",
  "service": "Vision Mapping Management System Backend"
}
```

### Register

```text
POST /auth/register
```

Body:

```json
{
  "fullName": "Demo User",
  "email": "demo@example.com",
  "password": "Password123"
}
```

### Login

```text
POST /auth/login
```

Body:

```json
{
  "email": "demo@example.com",
  "password": "Password123"
}
```

Auth response:

```json
{
  "token": "...",
  "tokenType": "Bearer",
  "userId": 1,
  "fullName": "Demo User",
  "email": "demo@example.com",
  "role": "USER"
}
```

## Standard CRUD Pattern

Most resources support:

```text
GET    /{resource}
POST   /{resource}
GET    /{resource}/{id}
PUT    /{resource}/{id}
PATCH  /{resource}/{id}/status
DELETE /{resource}/{id}
```

Delete usually archives, pauses, closes, or accepts instead of permanent deletion.

## Resources

### Vision Areas

```text
/vision-areas
```

Create body:

```json
{
  "name": "Career Development",
  "description": "Professional growth area",
  "priority": "HIGH",
  "status": "ACTIVE"
}
```

### Dreams

```text
/dreams
```

Create body:

```json
{
  "visionAreaId": 1,
  "title": "Become a strong AI-assisted public health researcher",
  "description": "Build skill and confidence",
  "whyImportant": "Supports practical health research impact",
  "successDefinition": "A concept note is reviewed by a mentor",
  "dreamType": "LONG_TERM",
  "priority": "HIGH",
  "targetDate": "2026-12-31",
  "status": "ACTIVE"
}
```

### Goals

```text
/goals
```

### Steps

```text
/steps
```

Use Java/API entity name `VisionStep` in backend code, but API route is `/steps`.

### Tasks

```text
/tasks
```

Blocked task rule:

```json
{
  "status": "BLOCKED",
  "blockerReason": "Need mentor feedback"
}
```

If `status` is `BLOCKED`, `blockerReason` is required.

### Partners

```text
/partners
```

Supports linking to Vision Area, Dream, Goal, Step, or Task.

### Communication Messages

```text
/communication-messages
```

Supports draft, sent, followed up, replied, and closed statuses.

### Reviews

```text
/reviews
```

Review types:
- DAILY
- WEEKLY
- MONTHLY
- QUARTERLY

### Obstacles

```text
/obstacles
```

Obstacle types:
- KNOWLEDGE
- SKILL
- TIME
- MONEY
- MOTIVATION
- PARTNER
- SYSTEM
- DECISION
- OTHER

### Progress Logs

```text
/progress-logs
```

### Dashboard

```text
GET /dashboard
```

Returns:
- totalVisionAreas
- activeDreams
- activeGoals
- activeTasks
- completedTasks
- overdueTasks
- blockedTasks
- averageProgress
- tasksDueThisWeek
- goalsByStatus
- dreamsByVisionArea

## Excel

### Export

```text
POST /excel/export
```

Returns an `.xlsx` workbook.

### Import

```text
POST /excel/import
Content-Type: multipart/form-data
```

Form field:

```text
file
```

Current import behavior validates sheet structure and reports row counts. It does not yet insert rows.
