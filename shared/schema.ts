import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Color data model for brand color database
export const colors = pgTable("colors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  hex: varchar("hex", { length: 7 }).notNull(), // e.g., #FF5733
  hue: text("hue").notNull(), // red, green, blue, yellow, orange, purple, pink, neutral
  keywords: text("keywords").array().notNull(), // pastel, light, dark, vibrant, muted, neutral
});

export const insertColorSchema = createInsertSchema(colors).omit({
  id: true,
});

export type InsertColor = z.infer<typeof insertColorSchema>;
export type Color = typeof colors.$inferSelect;

// Filter types
export const hueFilterSchema = z.enum(["all", "red", "green", "blue", "yellow", "orange", "purple", "pink", "neutral"]);
export const keywordFilterSchema = z.enum(["all", "pastel", "light", "dark", "vibrant", "muted", "neutral"]);

export type HueFilter = z.infer<typeof hueFilterSchema>;
export type KeywordFilter = z.infer<typeof keywordFilterSchema>;