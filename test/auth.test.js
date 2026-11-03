import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { generateKeyPair, SignJWT } from "jose";
import { config } from "../src/config/index.js";
import { createAuthMiddleware, verifyToken } from "../src/middleware/auth.js";

function app(verify) {
  const instance = express();
  instance.get("/private", createAuthMiddleware(verify), (req, res) =>
    res.json(req.user),
  );
  return instance;
}
test("missing and invalid bearer tokens cannot access protected routes", async () => {
  const instance = app(async () => {
    throw new Error("Invalid signature");
  });
  assert.equal((await request(instance).get("/private")).status, 401);
  assert.equal(
    (await request(instance).get("/private").set("Authorization", "Bearer bad"))
      .status,
    401,
  );
});
test("verified token identity is used instead of caller supplied identity", async () => {
  const instance = app(async () => ({
    payload: {
      sub: "trusted-user",
      email: "reader@example.com",
      name: "Reader",
    },
  }));
  const response = await request(instance)
    .get("/private?userId=attacker")
    .set("Authorization", "Bearer signed-token");
  assert.equal(response.status, 200);
  assert.equal(response.body.id, "trusted-user");
});
test("tokens without identity claims are rejected", async () => {
  const response = await request(app(async () => ({ payload: {} })))
    .get("/private")
    .set("Authorization", "Bearer token");
  assert.equal(response.status, 401);
});

test("protected endpoints check the signature, issuer, audience and expiry of signed tokens", async () => {
  const trusted = await generateKeyPair("EdDSA");
  const other = await generateKeyPair("EdDSA");
  const endpoint = app((token) => verifyToken(token, trusted.publicKey));
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: config.issuer,
    aud: config.audience,
    sub: "reader",
    email: "reader@example.org",
    exp: now + 300,
  };
  for (const [overrides, key, expected] of [
    [{}, trusted.privateKey, 200],
    [{}, other.privateKey, 401],
    [{ iss: "wrong" }, trusted.privateKey, 401],
    [{ aud: "wrong" }, trusted.privateKey, 401],
    [{ exp: now - 1 }, trusted.privateKey, 401],
    [{ exp: undefined }, trusted.privateKey, 401],
  ]) {
    const token = await new SignJWT({ ...claims, ...overrides })
      .setProtectedHeader({ alg: "EdDSA" })
      .sign(key);
    const result = await request(endpoint)
      .get("/private")
      .set("Authorization", "Bearer " + token);
    assert.equal(result.status, expected);
  }
});
