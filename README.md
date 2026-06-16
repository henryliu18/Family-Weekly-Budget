# Family Weekly Budget Tracker Web App


## Docker deployment

Build and startup

```powershell
docker compose -p family-budget up --build
```

Startup in background

```powershell
docker compose -p family-budget up -d --build
```

Stop

```powershell
docker compose -p family-budget down
```

Access url

```text
http://127.0.0.1:5173/
```

Data file

```text
budget-store.json
```

Docker will be mapping the local file `budget-store.json` to container volume, so that the file can be persistent.
