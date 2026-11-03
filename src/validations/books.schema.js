import { z } from "zod";

export const categories = ["Fiction", "Science", "History", "Kids", "Others"];
export const bookSchema = z
  .object({
    title: z.string().trim().min(1, "Book title is required.").max(160),
    author: z.string().trim().min(1, "Author name is required.").max(120),
    category: z.enum(categories),
    image: z
      .url()
      .refine(
        (value) => value.startsWith("https://"),
        "Use an HTTPS image URL.",
      ),
    description: z
      .string()
      .trim()
      .min(10, "Write at least 10 characters about the book.")
      .max(3000),
    totalCopies: z.number().int().min(0).max(10000),
  })
  .strict();
