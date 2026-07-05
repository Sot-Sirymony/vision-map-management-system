# Data Model

## Core Hierarchy

```text
AppUser
  -> VisionArea
    -> Dream
      -> Goal
        -> VisionStep
          -> TaskItem
```

## AppUser

Stores account and authentication ownership.

Fields:
- id
- fullName
- email
- passwordHash
- role
- status
- createdAt
- updatedAt

## VisionArea

Major life or work category.

Fields:
- id
- code
- user
- name
- description
- priority
- status
- createdAt
- updatedAt

## Dream

Future outcome under a Vision Area.

Fields:
- id
- code
- user
- visionArea
- title
- description
- whyImportant
- successDefinition
- dreamType
- priority
- targetDate
- status
- createdAt
- updatedAt

## Goal

Specific result under a Dream.

Fields:
- id
- code
- user
- dream
- title
- description
- successCriteria
- priority
- targetDate
- status
- progressPercent
- manualProgressOverride
- createdAt
- updatedAt

## VisionStep

Ordered action stage under a Goal.

Fields:
- id
- code
- user
- goal
- title
- description
- sequenceNumber
- complex
- priority
- targetDate
- status
- progressPercent
- manualProgressOverride
- createdAt
- updatedAt

## TaskItem

Executable task under a VisionStep.

Fields:
- id
- code
- user
- step
- title
- description
- owner
- priority
- startDate
- dueDate
- status
- progressPercent
- estimatedHours
- actualHours
- blockerReason
- nextAction
- completedAt
- createdAt
- updatedAt

## Partner

Person or resource that supports progress.

Can link to:
- VisionArea
- Dream
- Goal
- VisionStep
- TaskItem

## CommunicationMessage

Structured partner communication draft or sent message.

Can link to:
- Partner
- Dream
- Goal
- TaskItem

## Review

Daily, weekly, monthly, or quarterly review.

Can link to:
- VisionArea
- Dream

## Obstacle

Progress blocker.

Can link to:
- Dream
- Goal
- VisionStep
- TaskItem
- required Partner

## ProgressLog

Task-level progress history.

Belongs to:
- TaskItem

## Business Rules

- A Dream must belong to a Vision Area.
- A Goal must belong to a Dream.
- A Step must belong to a Goal.
- A Task must belong to a Step.
- A blocked task must include `blockerReason`.
- Task progress is direct.
- Step progress is calculated from child tasks unless manually overridden.
- Goal progress is calculated from child steps unless manually overridden.
- Records are scoped to the authenticated user.



https://claude.ai/code/artifact/199cd8cd-8af3-4bd9-b68f-9c2d414def2f?via=auto_preview
