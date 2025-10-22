# Docker Deployment Guide

This guide explains how to containerize and deploy the Note-Taking App using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Building the Docker Image

### Method 1: Using Docker directly

```bash
# Build the image
docker build -t note-taking-app .

# Run the container
docker run -p 3001:3001 -v $(pwd)/notes.db:/app/notes.db note-taking-app
```

### Method 2: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

## Docker Commands

### Build the image
```bash
docker build -t note-taking-app .
```

### Run the container
```bash
docker run -p 3001:3001 -v $(pwd)/notes.db:/app/notes.db note-taking-app
```

### Run in detached mode
```bash
docker run -d -p 3001:3001 -v $(pwd)/notes.db:/app/notes.db --name note-app note-taking-app
```

### Stop the container
```bash
docker stop note-app
```

### Remove the container
```bash
docker rm note-app
```

### View logs
```bash
docker logs note-app
```

### Access the application
Open your browser and navigate to: http://localhost:3001

## Docker Compose Commands

### Start the application
```bash
docker-compose up
```

### Start in detached mode
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs
```

### Rebuild and restart
```bash
docker-compose up --build
```

## Volume Mounting

The database file (`notes.db`) is mounted as a volume to persist data between container restarts:

```bash
-v $(pwd)/notes.db:/app/notes.db
```

## Health Checks

The container includes health checks that verify the application is running correctly. You can check the health status with:

```bash
docker ps
```

## Production Deployment

For production deployment, consider:

1. Using environment variables for configuration
2. Setting up proper logging
3. Using a reverse proxy (nginx)
4. Setting up SSL/TLS certificates
5. Using a container orchestration platform (Kubernetes, Docker Swarm)

## Troubleshooting

### Container won't start
- Check if port 3001 is already in use
- Verify the Dockerfile syntax
- Check container logs: `docker logs <container-name>`

### Database issues
- Ensure the notes.db file has proper permissions
- Check if the volume mount is working correctly

### Performance issues
- Monitor container resource usage: `docker stats`
- Consider increasing memory limits if needed
