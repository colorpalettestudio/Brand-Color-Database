import { type Color, type InsertColor, classifyColorStyle, generateSynonyms } from "@shared/schema";
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
    const seedColors = colorSeedData as Array<Omit<Color, 'id'>>;
    
    // Generate additional colors to reach 600+ total
    const additionalColors = this.generateAdditionalColors(600 - seedColors.length);
    const allColors = [...seedColors, ...additionalColors];

    allColors.forEach(colorData => {
      const id = randomUUID();
      const color: Color = { ...colorData, id };
      this.colors.set(id, color);
    });
  }

  private generateAdditionalColors(count: number): Omit<Color, 'id'>[] {
    const colors: Omit<Color, 'id'>[] = [];
    const hues = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "neutral"];
    const descriptors = ["Deep", "Rich", "Bright", "Soft", "Warm", "Cool", "Bold", "Gentle", "Pure", "True"];
    const colorTypes = ["Shade", "Tone", "Tint", "Hue", "Blend", "Mix"];
    
    for (let i = 0; i < count; i++) {
      const hue = hues[i % hues.length];
      const descriptor = descriptors[i % descriptors.length];
      const colorType = colorTypes[Math.floor(i / hues.length) % colorTypes.length];
      const variant = Math.floor(i / (hues.length * colorTypes.length)) + 1;
      
      // Generate deterministic hex values based on index
      let hex: string;
      const baseHue = (i * 137.5) % 360; // Golden angle for good distribution
      const saturation = 30 + (i * 47) % 50; // 30-80%
      const lightness = 20 + (i * 31) % 60; // 20-80%
      
      // Convert HSL to RGB then to hex
      const rgb = this.hslToRgb(baseHue, saturation, lightness);
      hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
      
      const style = classifyColorStyle(hex);
      const keywords = generateSynonyms(hex, `${descriptor} ${hue}`, style);
      
      colors.push({
        name: `${descriptor} ${hue.charAt(0).toUpperCase() + hue.slice(1)} ${colorType}${variant > 1 ? ` ${variant}` : ''}`,
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
    const lowerQuery = query.toLowerCase();
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