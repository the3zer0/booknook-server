import { ObjectId } from "mongodb";
import { HttpError } from "../utils/errors.js";

export function objectId(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{24}$/i.test(value))
    throw new HttpError(400, "Invalid record ID.");
  return new ObjectId(value);
}
export function borrowDates(now = new Date()) {
  return {
    borrowDate: now,
    returnDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
}
