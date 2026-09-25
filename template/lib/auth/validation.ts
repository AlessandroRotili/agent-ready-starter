import { z } from "zod";
export const email = z.email().max(254);
export const password = z.string().min(12).max(128);
export const authInput = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("login"),
    email,
    password: z.string().min(1).max(128),
    next: z.string().max(500).optional(),
  }),
  z.object({ action: z.literal("signup"), email, password }),
  z.object({ action: z.literal("forgot"), email }),
  z.object({ action: z.literal("reset"), password }),
  z.object({ action: z.literal("logout") }),
]);
