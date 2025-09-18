import { type Color, type InsertColor, classifyColorStyle, generateSynonyms, generateProperColorName, hexToHsl } from "@shared/schema";
import { isValidHexColor, findSimilarColors } from "@shared/colorSimilarity";
import { categorizeColors, parseColorQuery, getScoredColors } from "@shared/colorCategorization";
import { randomUUID } from "crypto";
import colorSeedData from "@shared/colors.seed.json";

// Color database for brand colors
export interface IStorage {
  getAllColors(): Promise<Color[]>;
  getColorsByHue(hue: string): Promise<Color[]>;
  getColorsByKeyword(keyword: string): Promise<Color[]>;
  searchColors(query: string): Promise<Color[]>;
  createColor(color: InsertColor): Promise<Color>;
  replaceAllColors(colors: InsertColor[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private colors: Map<string, Color>;

  constructor() {
    this.colors = new Map();
    this.initializeColors();
  }

  private initializeColors() {
    // Load curated color database
    const rawSeedColors = colorSeedData as Array<Omit<Color, 'id'>>;
    
    // Track used names to ensure uniqueness across all colors
    const usedNames = new Set<string>();
    const uniqueSeedColors: Array<Omit<Color, 'id'>> = [];
    
    // Process seed colors to ensure uniqueness
    rawSeedColors.forEach(seedColor => {
      let uniqueName = seedColor.name;
      
      // If name is already used, generate a unique variation
      if (usedNames.has(uniqueName)) {
        uniqueName = generateProperColorName(seedColor.hex, usedNames);
      } else {
        usedNames.add(uniqueName);
      }
      
      uniqueSeedColors.push({
        ...seedColor,
        name: uniqueName
      });
    });
    
    // Generate additional colors with unique names
    const additionalColors = this.generateAdditionalColors(600 - uniqueSeedColors.length, usedNames);
    const allColors = [...uniqueSeedColors, ...additionalColors];

    allColors.forEach(colorData => {
      const id = randomUUID();
      const color: Color = { ...colorData, id };
      this.colors.set(id, color);
    });
  }

  private generateAdditionalColors(count: number, usedNames: Set<string>): Omit<Color, 'id'>[] {
    const colors: Omit<Color, 'id'>[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate deterministic hex values based on index
      const baseHue = (i * 137.5) % 360; // Golden angle for good distribution
      const saturation = 30 + (i * 47) % 50; // 30-80%
      const lightness = 20 + (i * 31) % 60; // 20-80%
      
      // Convert HSL to RGB then to hex
      const rgb = this.hslToRgb(baseHue, saturation, lightness);
      const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
      
      // Generate proper color name based on the actual hex color with uniqueness check
      const name = generateProperColorName(hex, usedNames);
      
      // Get the actual HSL values from the hex color to ensure hue category matches the color name
      const { h: actualHue, s: actualSaturation } = hexToHsl(hex);
      
      // Determine the hue category based on actual HSL values to match the naming function
      let hue: string;
      if (actualSaturation <= 12) {
        hue = "neutral";
      } else if (actualHue >= 345 || actualHue < 15) {
        hue = "red";
      } else if (actualHue >= 15 && actualHue < 45) {
        hue = "orange";
      } else if (actualHue >= 45 && actualHue < 75) {
        hue = "yellow";
      } else if (actualHue >= 75 && actualHue < 165) {
        hue = "green";
      } else if (actualHue >= 165 && actualHue < 195) {
        hue = "blue";
      } else if (actualHue >= 195 && actualHue < 255) {
        hue = "blue";
      } else if (actualHue >= 255 && actualHue < 285) {
        hue = "purple";
      } else if (actualHue >= 285 && actualHue < 345) {
        hue = "pink";
      } else {
        hue = "red";
      }
      
      const style = classifyColorStyle(hex);
      const keywords = generateSynonyms(hex, name, style);
      
      colors.push({
        name,
        hex,
        hue,
        keywords,
      });
    }
    
    return colors;
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  async getAllColors(): Promise<Color[]> {
    return Array.from(this.colors.values());
  }

  async getColorsByHue(hue: string): Promise<Color[]> {
    if (hue === "all") return this.getAllColors();
    return Array.from(this.colors.values()).filter(color => color.hue === hue);
  }

  async getColorsByKeyword(keyword: string): Promise<Color[]> {
    if (keyword === "all") return this.getAllColors();
    return Array.from(this.colors.values()).filter(color => 
      color.keywords.includes(keyword)
    );
  }

  async searchColors(query: string): Promise<Color[]> {
    const trimmedQuery = query.trim();
    
    // Check if query is a valid hex color code
    if (isValidHexColor(trimmedQuery)) {
      // Use hex similarity search with 90% threshold (10% tolerance)
      const allColors = Array.from(this.colors.values());
      const similarColors = findSimilarColors(trimmedQuery, allColors, 90);
      return similarColors;
    }
    
    // Try intelligent color categorization for descriptive queries
    const allColors = Array.from(this.colors.values());
    const parsedQuery = parseColorQuery(trimmedQuery);
    
    if (parsedQuery.isDescriptive) {
      // Use intelligent categorization system
      const scoredColors = categorizeColors(allColors, trimmedQuery);
      const filteredResults = getScoredColors(scoredColors);
      
      // If categorization found matches, return them sorted by relevance
      if (filteredResults.length > 0) {
        return filteredResults;
      }
      
      // If no categorized matches found, fall through to string-based search
    }
    
    // Fall back to string-based search for non-descriptive queries or when categorization yields no results
    const lowerQuery = trimmedQuery.toLowerCase();
    return Array.from(this.colors.values()).filter(color =>
      color.name.toLowerCase().includes(lowerQuery) ||
      color.hex.toLowerCase().includes(lowerQuery) ||
      color.hue.toLowerCase().includes(lowerQuery) ||
      color.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  }

  async createColor(insertColor: InsertColor): Promise<Color> {
    const id = randomUUID();
    const color: Color = { ...insertColor, id };
    this.colors.set(id, color);
    return color;
  }

  async replaceAllColors(insertColors: InsertColor[]): Promise<void> {
    this.colors.clear();
    insertColors.forEach(colorData => {
      const id = randomUUID();
      const color: Color = { ...colorData, id };
      this.colors.set(id, color);
    });
  }
}

export const storage = new MemStorage();