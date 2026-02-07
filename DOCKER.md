# Docker Setup Guide for TaskManagement Backend

This guide provides instructions for deploying the TaskManagement Backend service independently using Docker.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Database Connection (MongoDB Atlas)](#database-connection-mongodb-atlas)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

## Quick Start

### 1. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example` or the provided setup).

```bash
# Required variables
MONGO_URL=mongodb+srv://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
# etc.
```

### 2. Build and Start Backend

```bash
# Build and start the backend service
docker-compose up -d --build

# Check logs
docker-compose logs -f backend
```

## Environment Configuration

The backend requires several environment variables for proper operation. These are passed to the container via the `docker-compose.yml` file using your root `.env` file.

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | **Required**. Connection string for your database. |
| `JWT_SECRET` | Secret for authentication tokens. |
| `CLOUDINARY_*` | Credentials for image storage. |

## Database Connection (MongoDB Atlas)

Since this is a standalone deployment, it is highly recommended to use **MongoDB Atlas**. 

1. Obtain your connection string from the Atlas dashboard.
2. Update the `MONGO_URL` in your `.env` file:
   ```bash
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/taskdb
   ```
3. Restart the service:
   ```bash
   docker-compose up -d
   ```

## Useful Commands

```bash
# Stop the service
docker-compose down

# Restart the backend
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build backend

# Access container shell
docker-compose exec backend sh
```

## Troubleshooting

- **Connection Refused**: Ensure your `MONGO_URL` is correct and your IP is whitelisted in MongoDB Atlas.
- **Port Conflict**: If port 3000 is taken, modify the `ports` mapping in `docker-compose.yml`.
- **Logs**: Always check `docker-compose logs backend` for specific error messages.
