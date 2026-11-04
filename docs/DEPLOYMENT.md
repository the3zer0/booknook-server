# Deploy the API

Create a Node 22 web service from this repo (for example Render). Build with npm ci and start with npm start. Use the host's PORT. Set MONGODB_URI and MONGODB_DB for a persistent replica set. Permit network access from this host and the Next.js host. The app creates required indexes on connection. Use the local-db helper only for development.

Set CLIENT_URL for CORS and JWT_ISSUER to the canonical client HTTPS origin, without a trailing slash. Match JWT_AUDIENCE to the client. The server must reach the client's /api/auth/jwks. Set NEXT_PUBLIC_API_URL on the client and rebuild it. Check public GET /books and unauthenticated GET /borrows (401). Optionally run npm run seed to add the demonstration titles. Their cover paths are served by the client. Finish with the signed-in checks in the client deployment guide.
