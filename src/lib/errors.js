export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) return res.status(409).json({ message: "You already borrowed this book. Return it before borrowing again." });
  if (error.name === "ZodError") return res.status(400).json({ message: error.issues[0]?.message || "Please check your input." });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: status >= 500 ? "Something went wrong. Please try again." : error.message });
}
