# Backend Docker Compose Quick Reference

## Start Services (Production Mode)
```bash
cd /home/abhi/wellnest_project/backend
docker compose up -d
```

## Start Services (Development Mode - Recommended)
```bash
# Start MongoDB only
docker compose up -d mongodb

# Run backend in dev mode (hot reload)
npm run dev
```

## Stop Services
```bash
docker compose down
```

## View Logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# MongoDB only
docker compose logs -f mongodb
```

## Rebuild Backend Image
```bash
docker compose build backend
docker compose up -d backend
```

## Services
- **MongoDB**: `localhost:27017`
- **Backend API**: `localhost:8080`

## Notes
- MongoDB data persists in Docker volume `mongodb_data`
- Backend connects to blockchain network `artifacts_test`
- Connection profiles mounted as read-only volume
