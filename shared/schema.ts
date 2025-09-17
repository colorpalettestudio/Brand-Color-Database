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
export const keywordFilterSchema = z.enum(["all", "pastel", "light-neutrals", "dark-neutrals", "muted", "jewel", "vibrant", "earthy"]);

export type HueFilter = z.infer<typeof hueFilterSchema>;
export type KeywordFilter = z.infer<typeof keywordFilterSchema>;

// Color classification utilities
export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): HSL {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function classifyColorStyle(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  
  // Light neutrals: low saturation, high lightness
  if (s <= 10 && l >= 80) return "light-neutrals";
  
  // Dark neutrals: low lightness OR (low lightness and low saturation)
  // Include special cases for dark navy and emerald
  if (l <= 30 || (l <= 35 && s <= 25)) {
    // Special case for navy (180-230° hue range)
    if (l <= 25 && h >= 180 && h <= 230) return "dark-neutrals";
    // Special case for emerald (130-160° hue range)
    if (l <= 25 && h >= 130 && h <= 160) return "dark-neutrals";
    return "dark-neutrals";
  }
  
  // Pastel: high lightness, moderate saturation
  if (l >= 75 && s >= 15 && s <= 45) return "pastel";
  
  // Jewel tones: high saturation, moderate lightness
  if (s >= 55 && l >= 30 && l <= 55) return "jewel";
  
  // Vibrant: very high saturation, moderate to high lightness
  if (s >= 70 && l >= 45 && l <= 70) return "vibrant";
  
  // Earthy: specific hue ranges with moderate saturation
  if (((h >= 20 && h <= 60) || (h >= 60 && h <= 110)) && s >= 15 && s <= 50 && l >= 35 && l <= 70) {
    return "earthy";
  }
  
  // Muted: moderate saturation, moderate lightness
  if (s >= 20 && s <= 45 && l >= 40 && l <= 75) return "muted";
  
  // Fallback to the closest match
  if (l >= 80) return "light-neutrals";
  if (l <= 30) return "dark-neutrals";
  if (s >= 55) return "jewel";
  if (s >= 15) return "muted";
  return "dark-neutrals";
}

export function generateSynonyms(hex: string, name: string, style: string): string[] {
  const synonyms = [style];
  const { h, s, l } = hexToHsl(hex);
  
  switch (style) {
    case "light-neutrals":
      if (l >= 95) synonyms.push("white");
      else if (h >= 40 && h <= 60) synonyms.push("cream", "beige");
      else if (s <= 5) synonyms.push("light-gray");
      break;
    case "dark-neutrals":
      if (l <= 15) synonyms.push("black");
      else if (h >= 180 && h <= 230) synonyms.push("navy");
      else if (h >= 130 && h <= 160) synonyms.push("emerald");
      else synonyms.push("charcoal");
      break;
    case "earthy":
      if (h >= 60 && h <= 110) synonyms.push("olive", "sage");
      else if (h >= 20 && h <= 40) synonyms.push("clay", "terracotta");
      break;
  }
  
  return synonyms;
}