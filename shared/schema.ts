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
export const hueFilterSchema = z.enum(["all", "red", "green", "blue", "yellow", "orange", "purple", "pink", "neutral", "white", "black"]);
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

export function generateProperColorName(hex: string, usedNames: Set<string> = new Set()): string {
  const { h, s, l } = hexToHsl(hex);
  
  // Handle achromatic colors (grays, blacks, whites)
  if (s <= 8) {
    if (l >= 95) return "Snow White";
    if (l >= 90) return "Pearl White";
    if (l >= 85) return "Silver";
    if (l >= 75) return "Light Gray";
    if (l >= 65) return "Gray";
    if (l >= 50) return "Steel Gray";
    if (l >= 35) return "Charcoal";
    if (l >= 20) return "Graphite";
    if (l >= 10) return "Jet Black";
    return "Ebony";
  }
  
  // Define base color names based on hue ranges
  let baseColor = "";
  let modifierPrefix = "";
  let modifierSuffix = "";
  
  // Determine base color from hue
  if (h >= 0 && h < 15) {
    baseColor = "Red";
  } else if (h >= 15 && h < 45) {
    baseColor = h < 30 ? "Crimson" : "Orange";
  } else if (h >= 45 && h < 75) {
    baseColor = h < 60 ? "Gold" : "Yellow";
  } else if (h >= 75 && h < 105) {
    baseColor = "Chartreuse";
  } else if (h >= 105 && h < 135) {
    baseColor = "Green";
  } else if (h >= 135 && h < 165) {
    baseColor = h < 150 ? "Emerald" : "Jade";
  } else if (h >= 165 && h < 195) {
    baseColor = h < 180 ? "Teal" : "Cyan";
  } else if (h >= 195 && h < 225) {
    baseColor = "Blue";
  } else if (h >= 225 && h < 255) {
    baseColor = h < 240 ? "Azure" : "Violet";
  } else if (h >= 255 && h < 285) {
    baseColor = "Purple";
  } else if (h >= 285 && h < 315) {
    baseColor = h < 300 ? "Magenta" : "Fuchsia";
  } else if (h >= 315 && h < 345) {
    baseColor = "Rose";
  } else {
    baseColor = "Crimson";
  }
  
  // Apply lightness-based modifiers
  if (l >= 85) {
    if (s <= 30) modifierPrefix = "Pale ";
    else if (s <= 50) modifierPrefix = "Light ";
    else modifierPrefix = "Bright ";
  } else if (l >= 70) {
    if (s <= 30) modifierPrefix = "Soft ";
    else if (s >= 70) modifierPrefix = "Vibrant ";
    else modifierPrefix = "";
  } else if (l >= 50) {
    if (s <= 30) modifierPrefix = "Muted ";
    else if (s >= 70) modifierPrefix = "Bold ";
    else modifierPrefix = "";
  } else if (l >= 30) {
    if (s <= 30) modifierPrefix = "Dark ";
    else if (s >= 60) modifierPrefix = "Deep ";
    else modifierPrefix = "Rich ";
  } else {
    modifierPrefix = "Midnight ";
  }
  
  // Special names for certain hue/saturation/lightness combinations
  const specialNames: { [key: string]: string } = {
    // Reds
    "Deep Red": ["Burgundy", "Wine", "Maroon"][Math.floor(h/5) % 3],
    "Dark Red": ["Garnet", "Ruby", "Claret"][Math.floor(h/5) % 3],
    "Bright Red": ["Scarlet", "Cherry", "Crimson"][Math.floor(h/5) % 3],
    
    // Blues
    "Deep Blue": ["Navy", "Sapphire", "Indigo"][Math.floor(h/10) % 3],
    "Dark Blue": ["Midnight", "Cobalt", "Steel"][Math.floor(h/10) % 3],
    "Light Blue": ["Sky", "Powder", "Ice"][Math.floor(h/10) % 3],
    "Pale Blue": ["Frost", "Mist", "Cloud"][Math.floor(h/10) % 3],
    
    // Greens
    "Deep Green": ["Forest", "Hunter", "Pine"][Math.floor(h/8) % 3],
    "Dark Green": ["Emerald", "Jade", "Malachite"][Math.floor(h/8) % 3],
    "Light Green": ["Mint", "Sage", "Seafoam"][Math.floor(h/8) % 3],
    "Pale Green": ["Honeydew", "Lime", "Spring"][Math.floor(h/8) % 3],
    
    // Purples
    "Deep Purple": ["Plum", "Eggplant", "Amethyst"][Math.floor(h/12) % 3],
    "Dark Purple": ["Violet", "Orchid", "Lavender"][Math.floor(h/12) % 3],
    "Light Purple": ["Lilac", "Periwinkle", "Mauve"][Math.floor(h/12) % 3],
    
    // Yellows
    "Deep Yellow": ["Mustard", "Amber", "Honey"][Math.floor(h/6) % 3],
    "Bright Yellow": ["Sunflower", "Lemon", "Canary"][Math.floor(h/6) % 3],
    "Light Yellow": ["Cream", "Vanilla", "Butter"][Math.floor(h/6) % 3],
    
    // Oranges
    "Deep Orange": ["Rust", "Copper", "Bronze"][Math.floor(h/7) % 3],
    "Bright Orange": ["Tangerine", "Pumpkin", "Sunset"][Math.floor(h/7) % 3],
    "Light Orange": ["Peach", "Coral", "Salmon"][Math.floor(h/7) % 3],
    
    // Pinks
    "Deep Rose": ["Fuchsia", "Magenta", "Hot Pink"][Math.floor(h/9) % 3],
    "Light Rose": ["Blush", "Cotton Candy", "Rose Quartz"][Math.floor(h/9) % 3],
    "Pale Rose": ["Baby Pink", "Powder Pink", "Dusty Rose"][Math.floor(h/9) % 3],
  };
  
  const combinedName = `${modifierPrefix}${baseColor}`.trim();
  
  // Use special name if available, otherwise use the constructed name
  if (specialNames[combinedName]) {
    return specialNames[combinedName];
  }
  
  // For very saturated colors, add distinctive suffixes
  if (s >= 80 && l >= 40 && l <= 70) {
    const suffixes = ["Burst", "Flash", "Glow"];
    modifierSuffix = ` ${suffixes[Math.floor(h/30) % 3]}`;
  }
  
  let finalName = `${modifierPrefix}${baseColor}${modifierSuffix}`.trim();
  
  // Ensure uniqueness by adding variations if the name is already used
  let uniqueName = finalName;
  let counter = 1;
  
  while (usedNames.has(uniqueName)) {
    counter++;
    
    // Try different variations before resorting to numbers
    if (counter === 2) {
      // Try with alternate descriptors
      const alternates = {
        "Deep": "Rich", "Rich": "Bold", "Bold": "Vivid",
        "Dark": "Midnight", "Midnight": "Shadow", "Shadow": "Obsidian",
        "Light": "Pale", "Pale": "Soft", "Soft": "Gentle",
        "Bright": "Brilliant", "Brilliant": "Radiant", "Radiant": "Luminous"
      };
      
      for (const [original, alternate] of Object.entries(alternates)) {
        if (modifierPrefix.includes(original)) {
          uniqueName = finalName.replace(original, alternate);
          break;
        }
      }
    } else if (counter === 3) {
      // Try geographic or nature-based variations
      const variations = {
        "Blue": ["Azure", "Cerulean", "Cobalt", "Steel", "Ocean"],
        "Green": ["Emerald", "Jade", "Forest", "Pine", "Mint"],
        "Red": ["Crimson", "Scarlet", "Cherry", "Burgundy", "Wine"],
        "Purple": ["Violet", "Plum", "Amethyst", "Lavender", "Orchid"],
        "Yellow": ["Gold", "Amber", "Honey", "Citrine", "Lemon"],
        "Orange": ["Coral", "Peach", "Copper", "Bronze", "Sunset"],
        "Pink": ["Rose", "Blush", "Fuchsia", "Magenta", "Carnation"],
        "Teal": ["Turquoise", "Aqua", "Seafoam", "Verdigris"],
        "Cyan": ["Aqua", "Turquoise", "Sky", "Ice"]
      };
      
      for (const [base, alternateList] of Object.entries(variations)) {
        if (baseColor === base) {
          const altIndex = (counter - 3) % alternateList.length;
          uniqueName = modifierPrefix + alternateList[altIndex] + modifierSuffix;
          break;
        }
      }
    } else {
      // As last resort, append Roman numerals (more elegant than numbers)
      const romanNumerals = ["", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
      const romanIndex = Math.min(counter - 3, romanNumerals.length - 1);
      uniqueName = `${finalName} ${romanNumerals[romanIndex]}`;
    }
  }
  
  usedNames.add(uniqueName);
  return uniqueName;
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