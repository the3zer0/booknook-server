# Pataghor API

Express and MongoDB power the library catalog and borrowing system. The client uses BetterAuth to issue short-lived JWTs. The API verifies the signature, issuer and audience and uses the verified identity for ownership checks.

## Local development

Install Node 22 or later and run npm ci. Keep the client in the sibling booknook-client directory. Run npm run db:local in a separate terminal for a persistent local replica set. Then run npm run seed once and npm start. The API listens on port 5000 by default. Use npm test to run the validation, auth and isolated MongoDB integration tests.

## Routes

| Method | Path | Access |
| --- | --- | --- |
| GET | /books | Public catalog. The mine=true filter requires login. |
| GET | /books/:id | Reader |
| POST | /books | Reader |
| PATCH | /books/:id | Owner |
| DELETE | /books/:id | Owner, after all copies return |
| POST | /borrows | Reader with an available copy |
| GET | /borrows | Current reader's active loans |
| DELETE | /borrows/:id | Borrower |

Use a replica set in production for atomic stock updates. Configure the variables from .env.example in your hosting environment. Seed only if you want demonstration titles, after setting the public client origin.

[Client repository and handoff](https://github.com/the3zer0/booknook-client)
