import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { createAuthMiddleware } from "../src/middleware/auth.js";

function app(verify) {
  const instance = express();
  instance.get("/private", createAuthMiddleware(verify), (req, res) => res.json(req.user));
  return instance;
}
test("missing and invalid bearer tokens cannot access protected routes", async () => {
  const instance = app(async () => { throw new Error("Invalid signature"); });
  assert.equal((await request(instance).get("/private")).status, 401);
  assert.equal((await request(instance).get("/private").set("Authorization", "Bearer bad")).status, 401);
});
test("verified token identity is used instead of caller supplied identity", async () => {
  const instance = app(async () => ({ payload: { sub: "trusted-user", email: "reader@example.com", name: "Reader" } }));
  const response = await request(instance).get("/private?userId=attacker").set("Authorization", "Bearer signed-token");
  assert.equal(response.status, 200);
  assert.equal(response.body.id, "trusted-user");
});
test("tokens without identity claims are rejected", async () => {
  const response = await request(app(async () => ({ payload: {} }))).get("/private").set("Authorization", "Bearer token");
  assert.equal(response.status, 401);
});
