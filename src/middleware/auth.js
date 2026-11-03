import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config/index.js";

const keys = createRemoteJWKSet(new URL("/api/auth/jwks", config.issuer));

export function verifyToken(token, keySet = keys) {
  return jwtVerify(token, keySet, {
    issuer: config.issuer,
    audience: config.audience,
    algorithms: ["EdDSA"],
    requiredClaims: ["exp", "sub", "email"],
  });
}

export function createAuthMiddleware(verify = verifyToken) {
  return async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer "))
      return res.status(401).json({ message: "Please log in to continue." });
    try {
      const { payload } = await verify(authorization.slice(7));
      if (typeof payload.sub !== "string" || typeof payload.email !== "string")
        throw new Error("Missing identity");
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : "Reader",
      };
      next();
    } catch {
      res
        .status(401)
        .json({
          message: "Your session could not be verified. Please log in again.",
        });
    }
  };
}
export const requireAuth = createAuthMiddleware();
