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