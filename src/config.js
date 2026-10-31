import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  database: process.env.MONGODB_DB || "pataghor",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  issuer: process.env.JWT_ISSUER || "http://localhost:3000",
  audience: process.env.JWT_AUDIENCE || "pataghor-api",
};
