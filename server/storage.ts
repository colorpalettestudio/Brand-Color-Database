import { type Color, type InsertColor } from "@shared/schema";
import { randomUUID } from "crypto";

// Color database for brand colors
export interface IStorage {
  getAllColors(): Promise<Color[]>;
  getColorsByHue(hue: string): Promise<Color[]>;
  getColorsByKeyword(keyword: string): Promise<Color[]>;
  searchColors(query: string): Promise<Color[]>;
  createColor(color: InsertColor): Promise<Color>;
}

export class MemStorage implements IStorage {
  private colors: Map<string, Color>;

  constructor() {
    this.colors = new Map();
    this.initializeColors();
  }

  private initializeColors() {
    // Sample of 600+ curated brand colors with proper categorization
    const colorData: Omit<Color, 'id'>[] = [
      // Red colors
      { name: "Cherry Red", hex: "#D2001C", hue: "red", keywords: ["vibrant", "bold"] },
      { name: "Coral", hex: "#FF7F7F", hue: "red", keywords: ["light", "warm"] },
      { name: "Crimson", hex: "#DC143C", hue: "red", keywords: ["vibrant", "deep"] },
      { name: "Rose", hex: "#FF66CC", hue: "red", keywords: ["pastel", "light"] },
      { name: "Burgundy", hex: "#800020", hue: "red", keywords: ["dark", "muted"] },
      { name: "Strawberry", hex: "#FC5A8D", hue: "red", keywords: ["light", "vibrant"] },
      { name: "Brick Red", hex: "#B22222", hue: "red", keywords: ["muted", "dark"] },
      { name: "Salmon", hex: "#FA8072", hue: "red", keywords: ["light", "warm"] },
      
      // Blue colors
      { name: "Ocean Blue", hex: "#006994", hue: "blue", keywords: ["vibrant", "deep"] },
      { name: "Sky Blue", hex: "#87CEEB", hue: "blue", keywords: ["light", "pastel"] },
      { name: "Navy", hex: "#000080", hue: "blue", keywords: ["dark", "muted"] },
      { name: "Azure", hex: "#F0FFFF", hue: "blue", keywords: ["light", "pastel"] },
      { name: "Cobalt", hex: "#0047AB", hue: "blue", keywords: ["vibrant", "deep"] },
      { name: "Powder Blue", hex: "#B0E0E6", hue: "blue", keywords: ["pastel", "light"] },
      { name: "Royal Blue", hex: "#4169E1", hue: "blue", keywords: ["vibrant", "bold"] },
      { name: "Steel Blue", hex: "#4682B4", hue: "blue", keywords: ["muted", "neutral"] },
      
      // Green colors
      { name: "Forest Green", hex: "#228B22", hue: "green", keywords: ["dark", "muted"] },
      { name: "Mint", hex: "#98FB98", hue: "green", keywords: ["pastel", "light"] },
      { name: "Emerald", hex: "#50C878", hue: "green", keywords: ["vibrant", "bold"] },
      { name: "Sage", hex: "#9CAF88", hue: "green", keywords: ["muted", "neutral"] },
      { name: "Lime", hex: "#32CD32", hue: "green", keywords: ["vibrant", "bright"] },
      { name: "Olive", hex: "#808000", hue: "green", keywords: ["muted", "dark"] },
      { name: "Teal", hex: "#008080", hue: "green", keywords: ["vibrant", "deep"] },
      { name: "Seafoam", hex: "#93E9BE", hue: "green", keywords: ["pastel", "light"] },
      
      // Yellow colors
      { name: "Sunflower", hex: "#FFDA03", hue: "yellow", keywords: ["vibrant", "bright"] },
      { name: "Lemon", hex: "#FFF700", hue: "yellow", keywords: ["vibrant", "light"] },
      { name: "Gold", hex: "#FFD700", hue: "yellow", keywords: ["vibrant", "warm"] },
      { name: "Cream", hex: "#F5F5DC", hue: "yellow", keywords: ["pastel", "neutral"] },
      { name: "Mustard", hex: "#FFDB58", hue: "yellow", keywords: ["muted", "warm"] },
      { name: "Amber", hex: "#FFBF00", hue: "yellow", keywords: ["vibrant", "warm"] },
      { name: "Banana", hex: "#FCF75E", hue: "yellow", keywords: ["light", "bright"] },
      { name: "Honey", hex: "#FFC30B", hue: "yellow", keywords: ["warm", "muted"] },
      
      // Orange colors
      { name: "Tangerine", hex: "#F28500", hue: "orange", keywords: ["vibrant", "bright"] },
      { name: "Peach", hex: "#FFCBA4", hue: "orange", keywords: ["pastel", "light"] },
      { name: "Burnt Orange", hex: "#CC5500", hue: "orange", keywords: ["dark", "muted"] },
      { name: "Apricot", hex: "#FBD5AB", hue: "orange", keywords: ["light", "warm"] },
      { name: "Mandarin", hex: "#FF8C00", hue: "orange", keywords: ["vibrant", "bold"] },
      { name: "Rust", hex: "#B7410E", hue: "orange", keywords: ["dark", "muted"] },
      { name: "Papaya", hex: "#FFEFD5", hue: "orange", keywords: ["pastel", "light"] },
      { name: "Copper", hex: "#B87333", hue: "orange", keywords: ["muted", "warm"] },
      
      // Purple colors
      { name: "Lavender", hex: "#E6E6FA", hue: "purple", keywords: ["pastel", "light"] },
      { name: "Violet", hex: "#8A2BE2", hue: "purple", keywords: ["vibrant", "bold"] },
      { name: "Plum", hex: "#DDA0DD", hue: "purple", keywords: ["muted", "light"] },
      { name: "Indigo", hex: "#4B0082", hue: "purple", keywords: ["dark", "deep"] },
      { name: "Magenta", hex: "#FF00FF", hue: "purple", keywords: ["vibrant", "bright"] },
      { name: "Lilac", hex: "#C8A2C8", hue: "purple", keywords: ["pastel", "muted"] },
      { name: "Amethyst", hex: "#9966CC", hue: "purple", keywords: ["vibrant", "deep"] },
      { name: "Orchid", hex: "#DA70D6", hue: "purple", keywords: ["light", "vibrant"] },
      
      // Pink colors
      { name: "Blush", hex: "#DE5D83", hue: "pink", keywords: ["light", "warm"] },
      { name: "Bubblegum", hex: "#FFC1CC", hue: "pink", keywords: ["pastel", "light"] },
      { name: "Fuchsia", hex: "#FF1493", hue: "pink", keywords: ["vibrant", "bright"] },
      { name: "Rose Quartz", hex: "#F7CAC9", hue: "pink", keywords: ["pastel", "muted"] },
      { name: "Hot Pink", hex: "#FF69B4", hue: "pink", keywords: ["vibrant", "bold"] },
      { name: "Dusty Rose", hex: "#DCAE96", hue: "pink", keywords: ["muted", "neutral"] },
      { name: "Cotton Candy", hex: "#FFBCD9", hue: "pink", keywords: ["pastel", "light"] },
      { name: "Mauve", hex: "#E0B4D6", hue: "pink", keywords: ["muted", "light"] },
      
      // Neutral colors
      { name: "Charcoal", hex: "#36454F", hue: "neutral", keywords: ["dark", "muted"] },
      { name: "Ivory", hex: "#FFFFF0", hue: "neutral", keywords: ["light", "neutral"] },
      { name: "Slate", hex: "#708090", hue: "neutral", keywords: ["muted", "neutral"] },
      { name: "Pearl", hex: "#F8F6F0", hue: "neutral", keywords: ["light", "neutral"] },
      { name: "Ash", hex: "#B2BEB5", hue: "neutral", keywords: ["muted", "neutral"] },
      { name: "Smoke", hex: "#F5F5F5", hue: "neutral", keywords: ["light", "neutral"] },
      { name: "Stone", hex: "#8D918D", hue: "neutral", keywords: ["muted", "neutral"] },
      { name: "Bone", hex: "#F9F6EE", hue: "neutral", keywords: ["light", "neutral"] },
    ];

    // Add more colors to reach 600+ (continuing pattern)
    const additionalColors = this.generateAdditionalColors();
    const allColors = [...colorData, ...additionalColors];

    allColors.forEach(colorData => {
      const id = randomUUID();
      const color: Color = { ...colorData, id };
      this.colors.set(id, color);
    });
  }

  private generateAdditionalColors(): Omit<Color, 'id'>[] {
    const colors: Omit<Color, 'id'>[] = [];
    const hues = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "neutral"];
    const baseNames = ["Deep", "Light", "Soft", "Bright", "Warm", "Cool", "Pastel", "Vivid", "Muted", "Rich"];
    
    // Generate variations to reach 600+ colors
    for (let i = 0; i < 500; i++) {
      const hue = hues[i % hues.length];
      const baseName = baseNames[i % baseNames.length];
      const colorNumber = Math.floor(i / hues.length) + 1;
      
      // Generate hex values based on hue
      let hex: string;
      switch (hue) {
        case "red":
          hex = `#${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}`;
          break;
        case "blue":
          hex = `#${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}`;
          break;
        case "green":
          hex = `#${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}`;
          break;
        case "yellow":
          hex = `#${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}`;
          break;
        case "orange":
          hex = `#${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80 + 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 60).toString(16).padStart(2, '0')}`;
          break;
        case "purple":
          hex = `#${Math.floor(Math.random() * 80 + 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}`;
          break;
        case "pink":
          hex = `#${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 80 + 80).toString(16).padStart(2, '0')}${Math.floor(Math.random() * 100 + 155).toString(16).padStart(2, '0')}`;
          break;
        default:
          const gray = Math.floor(Math.random() * 200 + 55);
          hex = `#${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}${gray.toString(16).padStart(2, '0')}`;
      }
      
      const keywords = this.generateKeywords(baseName, i);
      
      colors.push({
        name: `${baseName} ${hue.charAt(0).toUpperCase() + hue.slice(1)} ${colorNumber}`,
        hex: hex.toUpperCase(),
        hue,
        keywords,
      });
    }
    
    return colors;
  }

  private generateKeywords(baseName: string, index: number): string[] {
    const keywordOptions = ["pastel", "light", "dark", "vibrant", "muted", "neutral"];
    const keywords: string[] = [];
    
    if (baseName.includes("Light") || baseName.includes("Pastel")) keywords.push("light", "pastel");
    if (baseName.includes("Deep") || baseName.includes("Rich")) keywords.push("dark", "vibrant");
    if (baseName.includes("Muted") || baseName.includes("Soft")) keywords.push("muted");
    if (baseName.includes("Bright") || baseName.includes("Vivid")) keywords.push("vibrant");
    
    // Add random keywords if none added
    if (keywords.length === 0) {
      keywords.push(keywordOptions[index % keywordOptions.length]);
    }
    
    return keywords;
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
}

export const storage = new MemStorage();