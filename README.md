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

Example data file

```text
budget-store.example.json
```

Local runtime data file

```text
budget-store.json
```

`budget-store.example.json` is the repo-safe example file. `budget-store.json` is ignored by git and is used as the live local data file. Docker maps the local `budget-store.json` into the container so your working data stays persistent.
