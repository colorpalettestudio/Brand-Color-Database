// Color similarity utilities for hex color matching

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Validates if a string is a valid hex color code
 * Accepts formats: #RRGGBB or RRGGBB (case insensitive)
 */
export function isValidHexColor(input: string): boolean {
  const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
  return hexPattern.test(input.trim());
}

/**
 * Normalizes hex color input by ensuring it starts with # and is uppercase
 */
export function normalizeHexColor(input: string): string {
  const trimmed = input.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): RGB {
  const normalizedHex = normalizeHexColor(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

/**
 * Calculates Euclidean distance between two RGB colors
 * Returns a value where lower numbers indicate more similar colors
 */
export function calculateRgbDistance(rgb1: RGB, rgb2: RGB): number {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Calculates color similarity percentage (0-100%)
 * 100% = identical colors, 0% = maximum distance
 */
export function calculateSimilarity(hex1: string, hex2: string): number {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const distance = calculateRgbDistance(rgb1, rgb2);
    
    // Maximum possible distance in RGB space is sqrt(255^2 + 255^2 + 255^2) ≈ 441.67
    const maxDistance = Math.sqrt(255 * 255 * 3);
    const similarity = ((maxDistance - distance) / maxDistance) * 100;
    
    return Math.max(0, Math.min(100, similarity));
  } catch {
    return 0;
  }
}

/**
 * Checks if two colors are similar within a given threshold
 * @param hex1 First hex color
 * @param hex2 Second hex color  
 * @param threshold Similarity threshold as percentage (0-100)
 * @returns true if colors are similar within threshold
 */
export function areColorsSimilar(hex1: string, hex2: string, threshold: number = 90): boolean {
  const similarity = calculateSimilarity(hex1, hex2);
  return similarity >= threshold;
}

/**
 * Finds colors similar to a target hex color within a threshold
 * @param targetHex Target hex color to match
 * @param colors Array of colors to search through
 * @param threshold Similarity threshold (0-100), default 90% for 10% tolerance
 * @returns Array of colors sorted by similarity (most similar first)
 */
export function findSimilarColors<T extends { hex: string }>(
  targetHex: string, 
  colors: T[], 
  threshold: number = 90
): Array<T & { similarity: number }> {
  if (!isValidHexColor(targetHex)) {
    return [];
  }
  
  const normalizedTarget = normalizeHexColor(targetHex);
  
  return colors
    .map(color => ({
      ...color,
      similarity: calculateSimilarity(normalizedTarget, color.hex)
    }))
    .filter(color => color.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}