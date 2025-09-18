import { type Color, type HSL, hexToHsl } from "./schema";

// Query parsing interfaces
export interface ParsedColorQuery {
  hues: string[];
  lightnessDescriptors: string[];
  saturationDescriptors: string[];
  originalQuery: string;
  isDescriptive: boolean;
}

export interface ColorScore {
  color: Color;
  hueScore: number;
  lightnessScore: number;
  saturationScore: number;
  totalScore: number;
}

// Hue mapping - maps color names to hue ranges (degrees in HSL)
const HUE_MAPPINGS: Record<string, { ranges: Array<{ min: number; max: number }>, aliases: string[] }> = {
  red: { 
    ranges: [{ min: 345, max: 360 }, { min: 0, max: 15 }], 
    aliases: ['crimson', 'scarlet', 'cherry', 'rose', 'pink', 'magenta', 'burgundy', 'wine', 'maroon', 'garnet', 'ruby', 'claret']
  },
  orange: { 
    ranges: [{ min: 15, max: 45 }], 
    aliases: ['tangerine', 'pumpkin', 'rust', 'copper', 'bronze', 'coral', 'salmon', 'peach']
  },
  yellow: { 
    ranges: [{ min: 45, max: 75 }], 
    aliases: ['gold', 'amber', 'honey', 'mustard', 'lemon', 'canary', 'sunflower', 'cream', 'vanilla', 'butter']
  },
  green: { 
    ranges: [{ min: 75, max: 165 }], 
    aliases: ['lime', 'chartreuse', 'emerald', 'jade', 'teal', 'mint', 'sage', 'seafoam', 'forest', 'hunter', 'pine', 'olive', 'malachite', 'honeydew', 'spring']
  },
  blue: { 
    ranges: [{ min: 165, max: 255 }], 
    aliases: ['cyan', 'azure', 'navy', 'sapphire', 'indigo', 'cobalt', 'steel', 'sky', 'powder', 'ice', 'frost', 'mist', 'cloud', 'midnight']
  },
  purple: { 
    ranges: [{ min: 255, max: 315 }], 
    aliases: ['violet', 'lavender', 'plum', 'eggplant', 'amethyst', 'orchid', 'lilac', 'periwinkle', 'mauve', 'fuchsia']
  },
  pink: { 
    ranges: [{ min: 315, max: 345 }], 
    aliases: ['rose', 'blush', 'cotton candy', 'rose quartz', 'baby pink', 'powder pink', 'dusty rose', 'hot pink']
  },
  neutral: { 
    ranges: [{ min: 0, max: 360 }], // Will be filtered by saturation instead
    aliases: ['gray', 'grey', 'silver', 'charcoal', 'graphite', 'black', 'white', 'beige', 'cream', 'ivory', 'pearl', 'snow', 'ebony', 'jet']
  }
};

// Lightness descriptors
const LIGHTNESS_DESCRIPTORS = {
  light: ['light', 'pale', 'bright', 'soft', 'pastel', 'powder', 'ice', 'frost', 'mist', 'cloud', 'snow', 'pearl', 'cream', 'vanilla', 'butter'],
  dark: ['dark', 'deep', 'rich', 'midnight', 'shadow', 'charcoal', 'graphite', 'jet', 'ebony', 'navy', 'forest', 'wine', 'burgundy', 'maroon'],
  medium: ['medium', 'regular', 'normal', 'standard']
};

// Saturation descriptors  
const SATURATION_DESCRIPTORS = {
  neon: ['neon', 'electric', 'fluorescent', 'glow', 'luminous', 'radioactive', 'laser', 'cyberpunk', 'day-glo', 'highlighter'],
  vibrant: ['vibrant', 'bright', 'bold', 'vivid', 'intense', 'rich', 'saturated', 'brilliant', 'burst', 'flash', 'energetic', 'dynamic'],
  muted: ['muted', 'soft', 'subtle', 'pastel', 'pale', 'faded', 'washed', 'dusty', 'sage', 'powder', 'stone'],
  neutral: ['neutral', 'gray', 'grey', 'beige', 'cream', 'ivory', 'silver', 'charcoal']
};

/**
 * Parses a natural language color query to extract hue, lightness, and saturation information
 */
export function parseColorQuery(query: string): ParsedColorQuery {
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  const hues: string[] = [];
  const lightnessDescriptors: string[] = [];
  const saturationDescriptors: string[] = [];
  
  // Check for hue matches
  for (const [hue, mapping] of Object.entries(HUE_MAPPINGS)) {
    // Check main hue name
    if (words.includes(hue)) {
      hues.push(hue);
    }
    // Check aliases
    for (const alias of mapping.aliases) {
      if (words.some(word => word.includes(alias) || alias.includes(word))) {
        hues.push(hue);
        break;
      }
    }
  }
  
  // Check for lightness descriptors
  for (const [category, descriptors] of Object.entries(LIGHTNESS_DESCRIPTORS)) {
    for (const descriptor of descriptors) {
      if (words.some(word => word.includes(descriptor) || descriptor.includes(word))) {
        lightnessDescriptors.push(category);
        break;
      }
    }
  }
  
  // Check for saturation descriptors
  for (const [category, descriptors] of Object.entries(SATURATION_DESCRIPTORS)) {
    for (const descriptor of descriptors) {
      if (words.some(word => word.includes(descriptor) || descriptor.includes(word))) {
        saturationDescriptors.push(category);
        break;
      }
    }
  }
  
  // Remove duplicates
  const uniqueHues = Array.from(new Set(hues));
  const uniqueLightness = Array.from(new Set(lightnessDescriptors));
  const uniqueSaturation = Array.from(new Set(saturationDescriptors));
  
  // Consider query descriptive if it has at least one hue + descriptor, or multiple descriptors, or single saturation descriptors like "neon"
  const isDescriptive = (uniqueHues.length > 0 && (uniqueLightness.length > 0 || uniqueSaturation.length > 0)) || 
                       (uniqueLightness.length > 0 && uniqueSaturation.length > 0) ||
                       (uniqueHues.length > 1) ||
                       (uniqueSaturation.length > 0) ||
                       (uniqueLightness.length > 0);
  
  return {
    hues: uniqueHues,
    lightnessDescriptors: uniqueLightness,
    saturationDescriptors: uniqueSaturation,
    originalQuery: query,
    isDescriptive
  };
}

/**
 * Calculates how well a hue matches the queried hues
 */
function calculateHueScore(colorHsl: HSL, queryHues: string[]): number {
  if (queryHues.length === 0) return 1; // No hue preference
  
  let maxScore = 0;
  
  for (const queryHue of queryHues) {
    const mapping = HUE_MAPPINGS[queryHue];
    if (!mapping) continue;
    
    let hueScore = 0;
    
    // Special handling for neutral colors
    if (queryHue === 'neutral') {
      // Neutral colors should have low saturation
      hueScore = colorHsl.s <= 15 ? 1 : Math.max(0, (15 - colorHsl.s) / 15);
    } else {
      // Calculate score based on hue ranges
      for (const range of mapping.ranges) {
        const hue = colorHsl.h;
        let distance = 0;
        
        if (range.min <= range.max) {
          // Normal range (e.g., 15-45)
          if (hue >= range.min && hue <= range.max) {
            distance = 0; // Perfect match
          } else {
            distance = Math.min(
              Math.abs(hue - range.min),
              Math.abs(hue - range.max)
            );
          }
        } else {
          // Wrap-around range (e.g., 345-15 for red)
          if (hue >= range.min || hue <= range.max) {
            distance = 0; // Perfect match
          } else {
            distance = Math.min(
              Math.abs(hue - range.min),
              Math.abs(hue - (range.max + 360)),
              Math.abs((hue + 360) - range.min),
              Math.abs(hue - range.max)
            );
          }
        }
        
        // Convert distance to score (closer = higher score)
        const rangeScore = Math.max(0, 1 - distance / 60); // 60 degrees tolerance
        hueScore = Math.max(hueScore, rangeScore);
      }
    }
    
    maxScore = Math.max(maxScore, hueScore);
  }
  
  return maxScore;
}

/**
 * Calculates how well a color's lightness matches the query
 */
function calculateLightnessScore(colorHsl: HSL, lightnessDescriptors: string[]): number {
  if (lightnessDescriptors.length === 0) return 1; // No lightness preference
  
  let maxScore = 0;
  const lightness = colorHsl.l;
  
  for (const descriptor of lightnessDescriptors) {
    let score = 0;
    
    switch (descriptor) {
      case 'light':
        // Light colors have high lightness (70-100)
        if (lightness >= 70) {
          score = 0.7 + (lightness - 70) / 30 * 0.3; // Scale from 0.7 to 1.0
        } else {
          score = Math.max(0, lightness / 70 * 0.7); // Scale from 0 to 0.7
        }
        break;
        
      case 'dark':
        // Dark colors have low lightness (0-40)
        if (lightness <= 40) {
          score = 0.7 + (40 - lightness) / 40 * 0.3; // Scale from 0.7 to 1.0
        } else {
          score = Math.max(0, (100 - lightness) / 60 * 0.7); // Scale from 0 to 0.7
        }
        break;
        
      case 'medium':
        // Medium lightness (30-70)
        if (lightness >= 30 && lightness <= 70) {
          const center = 50;
          const distance = Math.abs(lightness - center);
          score = Math.max(0, 1 - distance / 20);
        } else {
          score = 0.3; // Partial match for colors outside medium range
        }
        break;
    }
    
    maxScore = Math.max(maxScore, score);
  }
  
  return maxScore;
}

/**
 * Calculates how well a color's saturation matches the query
 */
function calculateSaturationScore(colorHsl: HSL, saturationDescriptors: string[]): number {
  if (saturationDescriptors.length === 0) return 1; // No saturation preference
  
  let maxScore = 0;
  const saturation = colorHsl.s;
  
  for (const descriptor of saturationDescriptors) {
    let score = 0;
    
    switch (descriptor) {
      case 'neon':
        // Neon colors have high saturation (70-100) and bright lightness (40-90)
        const lightness = colorHsl.l;
        if (saturation >= 80 && lightness >= 45 && lightness <= 80) {
          // Perfect neon zone - ultra-saturated and bright
          score = 0.9 + (saturation - 80) / 20 * 0.1; // Scale from 0.9 to 1.0
        } else if (saturation >= 70 && lightness >= 35 && lightness <= 85) {
          // Close to neon - high saturation and decent brightness
          score = 0.6 + (saturation - 70) / 30 * 0.3; // Scale from 0.6 to 0.9
        } else if (saturation >= 60 && lightness >= 30 && lightness <= 90) {
          // Moderately neon - decent saturation and brightness
          score = 0.4 + (saturation - 60) / 40 * 0.2; // Scale from 0.4 to 0.6
        } else {
          // Gradual falloff for colors that aren't saturated/bright enough
          const satScore = Math.max(0, (saturation - 40) / 60);
          const lightScore = lightness >= 25 && lightness <= 95 ? 1 : Math.max(0, 1 - Math.abs(lightness - 60) / 40);
          score = Math.max(0, satScore * lightScore * 0.3);
        }
        break;
        
      case 'vibrant':
        // Vibrant colors have high saturation (60-100)
        if (saturation >= 60) {
          score = 0.7 + (saturation - 60) / 40 * 0.3; // Scale from 0.7 to 1.0
        } else {
          score = Math.max(0, saturation / 60 * 0.7); // Scale from 0 to 0.7
        }
        break;
        
      case 'muted':
        // Muted colors have low to medium saturation (0-50)
        if (saturation <= 50) {
          score = 0.7 + (50 - saturation) / 50 * 0.3; // Scale from 0.7 to 1.0
        } else {
          score = Math.max(0, (100 - saturation) / 50 * 0.7); // Scale from 0 to 0.7
        }
        break;
        
      case 'neutral':
        // Neutral colors have very low saturation (0-15)
        if (saturation <= 15) {
          score = 0.8 + (15 - saturation) / 15 * 0.2; // Scale from 0.8 to 1.0
        } else {
          score = Math.max(0, (30 - saturation) / 30 * 0.5); // Gradual falloff
        }
        break;
    }
    
    maxScore = Math.max(maxScore, score);
  }
  
  return maxScore;
}

/**
 * Scores a single color against a parsed query
 */
export function scoreColor(color: Color, parsedQuery: ParsedColorQuery): ColorScore {
  const hsl = hexToHsl(color.hex);
  
  const hueScore = calculateHueScore(hsl, parsedQuery.hues);
  const lightnessScore = calculateLightnessScore(hsl, parsedQuery.lightnessDescriptors);
  const saturationScore = calculateSaturationScore(hsl, parsedQuery.saturationDescriptors);
  
  // Weight the scores - hue is most important, then lightness, then saturation
  const hueWeight = 0.5;
  const lightnessWeight = 0.3;
  const saturationWeight = 0.2;
  
  const totalScore = (hueScore * hueWeight) + (lightnessScore * lightnessWeight) + (saturationScore * saturationWeight);
  
  return {
    color,
    hueScore,
    lightnessScore,
    saturationScore,
    totalScore
  };
}

/**
 * Scores and sorts colors based on a descriptive query
 */
export function categorizeColors(colors: Color[], query: string): ColorScore[] {
  const parsedQuery = parseColorQuery(query);
  
  if (!parsedQuery.isDescriptive) {
    // Return empty array to indicate non-descriptive query
    return [];
  }
  
  const scoredColors = colors.map(color => scoreColor(color, parsedQuery));
  
  // Sort by total score (highest first), then by individual scores as tiebreakers
  scoredColors.sort((a, b) => {
    if (Math.abs(a.totalScore - b.totalScore) < 0.01) {
      // If total scores are very close, use hue score as tiebreaker
      if (Math.abs(a.hueScore - b.hueScore) < 0.01) {
        // If hue scores are close, use lightness score
        return b.lightnessScore - a.lightnessScore;
      }
      return b.hueScore - a.hueScore;
    }
    return b.totalScore - a.totalScore;
  });
  
  return scoredColors;
}

/**
 * Utility function to get just the colors from scored results
 */
export function getScoredColors(scoredColors: ColorScore[]): Color[] {
  return scoredColors.map(scored => scored.color);
}

/**
 * Debug function to log scoring details
 */
export function debugColorScoring(color: Color, parsedQuery: ParsedColorQuery): void {
  const scored = scoreColor(color, parsedQuery);
  console.log(`Color: ${color.name} (${color.hex})`);
  console.log(`  HSL: ${JSON.stringify(hexToHsl(color.hex))}`);
  console.log(`  Query: ${parsedQuery.originalQuery}`);
  console.log(`  Parsed: ${JSON.stringify(parsedQuery)}`);
  console.log(`  Scores: H=${scored.hueScore.toFixed(2)}, L=${scored.lightnessScore.toFixed(2)}, S=${scored.saturationScore.toFixed(2)}, Total=${scored.totalScore.toFixed(2)}`);
}