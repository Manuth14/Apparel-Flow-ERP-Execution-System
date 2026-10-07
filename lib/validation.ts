import { z } from "zod";
import { ApiError } from "@/lib/errors";

export const CountSchema = z.object({
  counts: z
    .array(
      z.object({
        itemId: z.string().min(1, "Missing component id."),
        actualQty: z
          .number("Counts must be numbers.")
          .int("Counts must be whole numbers.")
          .min(0, "Counts cannot be negative.")
          .max(1000000, "Count is too large."),
      }),
    )
    .min(1, "Send at least one count.")
    .max(100, "Too many components."),
});

export const RejectSchema = z.object({
  note: z
    .string("A rejection reason is required.")
    .trim()
    .min(5, "A rejection reason of at least 5 characters is required.")
    .max(500, "Rejection reason is too long (max 500 characters)."),
});

export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message ?? "Invalid request.");
  }
  return result.data;
}
