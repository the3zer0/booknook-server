# BookNook API

### The service behind the community bookshelf

A REST API for the BookNook catalog and borrowing workflow. Express handles requests, MongoDB stores the library, and short-lived Better Auth JWTs identify readers for protected actions.

[**Open the live library →**](https://booknook-client-os8h.vercel.app/) · [Client repository](https://github.com/the3zer0/booknook-client) · [Client README](https://github.com/the3zer0/booknook-client#booknook)

---

## What it supports

- Browse the public catalog, ordered newest first, or request the latest six books.
- Add books and manage a reader's own titles with ownership checks.
- Borrow and return copies with atomic stock changes.
- Prevent unavailable and duplicate active borrows.
- Verify JWT signature, issuer, audience and expiry before protected operations.
- Validate request data and return clear API errors.

## API routes

| Method | Path | Access |
| --- | --- | --- |
| `GET` | `/books` | Public catalog; `mine=true` requires a reader token |
| `GET` | `/books/:id` | Reader token |
| `POST` | `/books` | Reader token |
| `PATCH` | `/books/:id` | Book owner |
| `DELETE` | `/books/:id` | Book owner; no active borrows |
| `POST` | `/borrows` | Reader token; available copy required |
| `GET` | `/borrows` | Reader's own active loans |
| `DELETE` | `/borrows/:id` | Borrower |

Protected routes expect `Authorization: Bearer <token>`. See the [API contract](docs/API.md) for request and response details.

## Run locally

Use Node.js 22 or later and clone this repository beside `booknook-client`. Install dependencies and start the persistent local MongoDB replica set:

```bash
npm ci
npm run db:local
```

In another server terminal, seed the six sample titles and run the API:

```bash
npm run seed
npm start
```

The API listens on port `5000` by default. Set production values using the names in `.env.example`. MongoDB transactions require a replica set, including in production.

## Verify and deploy

```bash
npm test
```

Configure environment values in your hosting service and follow the [deployment guide](docs/DEPLOYMENT.md). Do not commit credentials.

## Project links

- [Client source](https://github.com/the3zer0/booknook-client)
- [Server source](https://github.com/the3zer0/booknook-server)
- [Live website](https://booknook-client-os8h.vercel.app/)
