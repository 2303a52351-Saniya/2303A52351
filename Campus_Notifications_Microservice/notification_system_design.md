# Campus Notifications Microservice

# Stage 1

## Overview

The Campus Notifications Microservice allows students to receive notifications related to:

- Placements
- Events
- Results

The system supports:

- Fetch notifications
- Fetch unread notifications
- Mark notification as read
- Mark all notifications as read
- Real-time notification delivery

---

## Authentication

All APIs require:

Authorization Header:

```
Authorization: Bearer <token>
```

---

## 1. Get Notifications

### Endpoint

GET /api/notifications

### Request Headers

```http
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "n101",
      "title": "Placement Drive",
      "message": "TCS placement drive scheduled",
      "type": "Placement",
      "isRead": false,
      "createdAt": "2026-06-18T10:00:00Z"
    }
  ]
}
```

---

## 2. Get Unread Notifications

### Endpoint

GET /api/notifications/unread

### Response

```json
{
  "success": true,
  "count": 5,
  "data": []
}
```

---

## 3. Mark Notification as Read

### Endpoint

PATCH /api/notifications/{id}/read

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 4. Mark All Notifications as Read

### Endpoint

PATCH /api/notifications/read-all

### Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Notification Schema

```json
{
  "id": "string",
  "title": "string",
  "message": "string",
  "type": "Placement | Event | Result",
  "isRead": false,
  "createdAt": "timestamp"
}
```

---

## Real-Time Notification Mechanism

WebSocket connection:

```
ws://server/notifications
```

When a new notification arrives:

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "n102",
    "title": "Exam Result",
    "message": "Semester results published"
  }
}
```

Students receive notifications instantly without refreshing the page.


# Stage 2

## Database Choice

I recommend PostgreSQL because:

- Strong ACID compliance
- Reliable transactions
- Efficient indexing
- Supports large datasets
- Good performance for notification queries

---

## Database Schema

### students

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE
);
```

### notifications

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    title VARCHAR(255),
    message TEXT,
    notification_type VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Recommended Indexes

```sql
CREATE INDEX idx_notifications_student
ON notifications(student_id);

CREATE INDEX idx_notifications_read
ON notifications(is_read);

CREATE INDEX idx_notifications_created
ON notifications(created_at DESC);
```

---

## Potential Scaling Problems

As notification volume grows:

- Query response time increases
- Full table scans become expensive
- Storage usage grows rapidly
- Concurrent user requests increase DB load

---

## Solutions

### Indexing

Use indexes on:

- student_id
- is_read
- created_at

### Pagination

Fetch notifications in pages instead of loading all records.

Example:

```sql
SELECT *
FROM notifications
WHERE student_id = 101
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Archiving

Move old notifications to archive tables.

### Caching

Use Redis to cache frequently accessed notification data.

---

## Sample Queries

### Get All Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 101
ORDER BY created_at DESC;
```

### Get Unread Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = 101
AND is_read = FALSE
ORDER BY created_at DESC;
```

### Mark Notification As Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = 10;
```

### Mark All Notifications As Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE student_id = 101;
```


# Stage 3

## Query Analysis

### Current Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

### Is the Query Accurate?

Yes. The query correctly fetches unread notifications for a specific student and sorts them in descending order by creation time.

### Why is it Slow?

- Database contains millions of notifications.
- Full table scans may occur without indexes.
- SELECT * fetches unnecessary columns.
- Sorting becomes expensive on large datasets.

### Recommended Improvement

Create a composite index:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

Optimized Query:

```sql
SELECT id, title, message, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC
LIMIT 50;
```

### Likely Computation Cost

Without Index:
- O(N)

With Index:
- O(log N)

### Should We Add Indexes On Every Column?

No.

Reasons:

- Increases storage usage.
- Slows INSERT and UPDATE operations.
- Adds maintenance overhead.
- Many indexes may never be used.

### Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 DAYS';
```


# Stage 4

## Problem

Currently, notifications are fetched from the database every time a student loads the page. With thousands of students accessing the system simultaneously, the database receives a large number of repeated queries, causing increased latency and poor user experience.

## Proposed Solutions

### 1. Redis Caching

Store frequently accessed notifications in Redis.

Flow:

1. User requests notifications.
2. Application checks Redis cache.
3. If data exists, return from cache.
4. If data does not exist, fetch from database and store in Redis.

Benefits:

- Reduces database load.
- Faster response times.
- Better scalability.

Tradeoffs:

- Additional infrastructure required.
- Cache invalidation complexity.
- Extra memory usage.

---

### 2. Pagination

Instead of loading all notifications, fetch only a limited number at a time.

Example:

```sql
SELECT *
FROM notifications
WHERE student_id = 1042
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

Benefits:

- Smaller result sets.
- Faster queries.
- Reduced network usage.

Tradeoffs:

- Additional API requests.
- Slightly more frontend complexity.

---

### 3. WebSockets

Use WebSockets to push notifications in real time instead of repeatedly fetching data.

Benefits:

- Instant updates.
- Eliminates constant polling.
- Better user experience.

Tradeoffs:

- More complex implementation.
- Requires connection management.

---

### 4. Database Indexing

Create indexes on frequently queried columns.

Example:

```sql
CREATE INDEX idx_notifications_student_created
ON notifications(student_id, created_at DESC);
```

Benefits:

- Faster query execution.
- Reduced scan time.

Tradeoffs:

- Additional storage usage.
- Slightly slower inserts and updates.

---

## Recommended Approach

Use:

- Redis Caching
- Pagination
- WebSockets
- Proper Database Indexing

Together these provide the best balance between performance, scalability, and user experience.


# Stage 5

## Analysis of Current Implementation

Current pseudocode:

```python
function notify_all(student_ids, message):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```

### Problems

For 50,000 students, this approach is inefficient because:

1. Operations are executed sequentially.
2. Email API calls are slow and may hit rate limits.
3. Database inserts occur one at a time.
4. Notification delivery will take a very long time.
5. Failure for one student may affect the entire process.

---

## Recommended Architecture

Use an asynchronous event-driven architecture.

### Flow

1. HR clicks "Notify All".
2. Notification Service creates a notification job.
3. Job is pushed to a Message Queue (RabbitMQ, Kafka, or AWS SQS).
4. Multiple worker services process students in parallel.
5. Workers:
   - Send emails
   - Save notifications to database
   - Push real-time notifications through WebSockets.

### Architecture Diagram

HR Portal

↓

Notification Service

↓

Message Queue

↓

Worker Pool

↓

Email Service + Database + WebSocket Service

---

## Advantages

### Scalability

Workers can be increased horizontally to handle larger loads.

### Reliability

Failed messages can be retried automatically.

### Faster Processing

Thousands of notifications can be processed concurrently.

### Fault Tolerance

Failure of one worker does not stop the entire system.

---

## Database Optimization

Instead of inserting one row at a time:

```sql
INSERT INTO notifications (...)
VALUES (...);
```

Use batch inserts:

```sql
INSERT INTO notifications (...)
VALUES (...), (...), (...);
```

This significantly reduces database overhead.

---

## Recommended Solution

Use:

- Message Queue (Kafka/RabbitMQ/SQS)
- Worker Pool
- Batch Database Inserts
- WebSockets for real-time delivery
- Retry and Dead-Letter Queue mechanisms

This architecture can efficiently handle notifications for 50,000+ students while maintaining high performance and reliability.