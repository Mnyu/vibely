## Development

### Create `.env` file from `.env.sample` file.

### Start DB

```bash
docker compose up -d
```

### Run DB migrations

```bash
npx prisma migrate dev && npx prisma generate
```

To reset data in dev mode

```bash
npx prisma migrate reset
```

### Start the app

```bash
npm run dev
```

### Start inngest server

```bash
npx --ignore-scripts=false inngest-cli@latest dev
```

App = [http://localhost:3000](http://localhost:3000)

Inngest = [http://localhost:8288/](http://localhost:8288/)
