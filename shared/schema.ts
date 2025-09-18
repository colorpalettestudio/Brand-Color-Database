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

// Color temperature filter schema
export const temperatureFilterSchema = z.enum(["all", "warm", "cool", "neutral"]);

// Comprehensive color family filter schema
export const familyFilterSchema = z.enum([
  "all", "red", "orange", "yellow", "lime", "green", "teal", 
  "cyan", "blue", "indigo", "violet", "magenta", "pink", 
  "brown", "gray", "white", "black"
]);

export type HueFilter = z.infer<typeof hueFilterSchema>;
export type KeywordFilter = z.infer<typeof keywordFilterSchema>;
export type TemperatureFilter = z.infer<typeof temperatureFilterSchema>;
export type FamilyFilter = z.infer<typeof familyFilterSchema>;

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
  
  let baseName = "";
  
  // Handle achromatic colors (grays, blacks, whites) - but don't return early!
  if (s <= 8) {
    if (l >= 95) baseName = "Snow White";
    else if (l >= 90) baseName = "Pearl White";
    else if (l >= 85) baseName = "Silver";
    else if (l >= 75) baseName = "Light Gray";
    else if (l >= 65) baseName = "Gray";
    else if (l >= 50) baseName = "Steel Gray";
    else if (l >= 35) baseName = "Charcoal";
    else if (l >= 20) baseName = "Graphite";
    else if (l >= 10) baseName = "Jet Black";
    else baseName = "Ebony";
  } else {
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
      baseName = specialNames[combinedName];
    } else {
      // For very saturated colors, add distinctive suffixes
      if (s >= 80 && l >= 40 && l <= 70) {
        const suffixes = ["Burst", "Flash", "Glow"];
        modifierSuffix = ` ${suffixes[Math.floor(h/30) % 3]}`;
      }
      baseName = `${modifierPrefix}${baseColor}${modifierSuffix}`.trim();
    }
  }
  
  // Ensure name uniqueness
  let uniqueName = baseName;
  let counter = 1;
  
  while (usedNames.has(uniqueName)) {
    counter++;
    
    // Create variations based on the color's properties to make them more natural
    if (counter === 2) {
      // First variation - add descriptive suffixes based on lightness/saturation
      if (l >= 70) uniqueName = `Light ${baseName}`;
      else if (l <= 30) uniqueName = `Dark ${baseName}`;
      else if (s >= 70) uniqueName = `Vivid ${baseName}`;
      else if (s <= 30) uniqueName = `Soft ${baseName}`;
      else uniqueName = `Rich ${baseName}`;
    } else if (counter === 3) {
      // Second variation - add hue-based suffixes
      if (h >= 0 && h < 60) uniqueName = `${baseName} Flame`;
      else if (h >= 60 && h < 120) uniqueName = `${baseName} Leaf`;
      else if (h >= 120 && h < 180) uniqueName = `${baseName} Sea`;
      else if (h >= 180 && h < 240) uniqueName = `${baseName} Sky`;
      else if (h >= 240 && h < 300) uniqueName = `${baseName} Dream`;
      else uniqueName = `${baseName} Rose`;
    } else if (counter === 4) {
      // Third variation - add saturation-based suffixes
      if (s >= 60) uniqueName = `${baseName} Burst`;
      else if (s >= 40) uniqueName = `${baseName} Glow`;
      else uniqueName = `${baseName} Mist`;
    } else if (counter === 5) {
      // Fourth variation - add lightness-based suffixes
      if (l >= 70) uniqueName = `${baseName} Shine`;
      else if (l >= 40) uniqueName = `${baseName} Shadow`;
      else uniqueName = `${baseName} Deep`;
    } else {
      // Final fallback - use Roman numerals
      const romanNumerals = ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const romanIndex = counter - 5; // Start Roman numerals after other variations
      if (romanIndex < romanNumerals.length) {
        uniqueName = `${baseName} ${romanNumerals[romanIndex]}`;
      } else {
        uniqueName = `${baseName} ${counter - 4}`; // Fallback to numbers
      }
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

/**
 * Classifies a color's temperature based on HSL values
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns "warm" | "cool" | "neutral"
 */
export function classifyColorTemperature(hex: string): "warm" | "cool" | "neutral" {
  const { h, s, l } = hexToHsl(hex);
  
  // Neutral: low saturation OR very dark OR very light (captures grays/black/white)
  if (s <= 12 || l <= 12 || l >= 92) {
    return "neutral";
  }
  
  // Warm: red-orange-yellow range with boundary handling
  // Includes: [345..360] ∪ [0..105] ∪ [315..345)
  if (h >= 345 || h <= 105 || (h >= 315 && h < 345)) {
    return "warm";
  }
  
  // Cool: green-blue-purple range [105..285] with boundary guards
  if (h > 105 && h < 315) {
    return "cool";
  }
  
  // Fallback (should not reach here with proper hue ranges)
  return "neutral";
}

/**
 * Classifies a color into detailed family categories with precedence rules
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns Detailed color family classification
 */
export function classifyColorFamily(hex: string): "red" | "orange" | "yellow" | "lime" | "green" | "teal" | "cyan" | "blue" | "indigo" | "violet" | "magenta" | "pink" | "brown" | "gray" | "white" | "black" {
  const { h, s, l } = hexToHsl(hex);
  
  // Precedence 1: White (very low saturation, very high lightness)
  if (s <= 8 && l >= 94) {
    return "white";
  }
  
  // Precedence 2: Black (very low saturation, very low lightness)
  if (s <= 10 && l <= 20) {
    return "black";
  }
  
  // Precedence 3: Gray (low saturation, medium lightness)
  if (s <= 10 && l > 20 && l < 94) {
    return "gray";
  }
  
  // Precedence 4: Brown (warm hues with specific saturation/lightness ranges)
  if (h >= 15 && h <= 60 && s >= 25 && s <= 60 && l >= 20 && l <= 55) {
    return "brown";
  }
  
  // Otherwise map hue ranges to 12 color families
  if (h >= 345 || h < 15) {
    return "red";
  } else if (h >= 15 && h < 45) {
    return "orange";
  } else if (h >= 45 && h < 75) {
    return "yellow";
  } else if (h >= 75 && h < 105) {
    return "lime";
  } else if (h >= 105 && h < 135) {
    return "green";
  } else if (h >= 135 && h < 165) {
    return "teal";
  } else if (h >= 165 && h < 195) {
    return "cyan";
  } else if (h >= 195 && h < 225) {
    return "blue";
  } else if (h >= 225 && h < 255) {
    return "indigo";
  } else if (h >= 255 && h < 285) {
    return "violet";
  } else if (h >= 285 && h < 315) {
    return "magenta";
  } else if (h >= 315 && h < 345) {
    return "pink";
  }
  
  // Fallback to red (should not reach here with proper hue ranges)
  return "red";
}