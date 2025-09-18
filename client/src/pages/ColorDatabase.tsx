import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ColorFilters from "@/components/ColorFilters";
import ColorGrid from "@/components/ColorGrid";
import ThemeToggle from "@/components/ThemeToggle";
import { Palette } from "lucide-react";
import type { Color, HueFilter, KeywordFilter, TemperatureFilter, FamilyFilter } from "@shared/schema";
import { hexToHsl, classifyColorTemperature, classifyColorFamily } from "@shared/schema";

/**
 * Calculate vividness (perceived saturation) using HSV instead of HSL.
 * HSL saturation can be misleadingly high for very light colors (near-whites),
 * while HSV saturation better represents perceptual saturation.
 */
function calculateVividness(hex: string): number {
  // Convert hex to RGB (0-1 range)
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  // HSV saturation
  const saturation = max === 0 ? 0 : delta / max;
  
  // HSV value (brightness)
  const value = max;
  
  // Vividness = S * V (penalizes both desaturated and very dark colors)
  return saturation * value;
}

/**
 * Calculate similarity between two hex colors using RGB distance
 */
function calculateColorSimilarity(hex1: string, hex2: string): number {
  const rgb1 = {
    r: parseInt(hex1.slice(1, 3), 16),
    g: parseInt(hex1.slice(3, 5), 16), 
    b: parseInt(hex1.slice(5, 7), 16)
  };
  const rgb2 = {
    r: parseInt(hex2.slice(1, 3), 16),
    g: parseInt(hex2.slice(3, 5), 16),
    b: parseInt(hex2.slice(5, 7), 16)
  };
  
  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) + 
    Math.pow(rgb1.g - rgb2.g, 2) + 
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  
  // Return similarity (lower distance = higher similarity)
  return distance;
}

/**
 * Enhanced color selection for beautiful rainbow display.
 * Balances vibrant colors and pastels while avoiding very similar colors.
 */
function selectBestColorsForRainbow(colors: Color[], maxColors: number): Color[] {
  if (colors.length === 0) return [];
  
  // Score each color for rainbow display appeal
  const scoredColors = colors.map(color => {
    const { h, s, l } = hexToHsl(color.hex);
    const vividness = calculateVividness(color.hex);
    
    let score = 0;
    
    // Boost pastels more to get better balance
    if (color.keywords.includes("pastel")) {
      // Higher boost for bright pastels
      if (l >= 75 && s >= 25) {
        score += 110; // Increased from 90
      } else if (l >= 70 && s >= 15) {
        score += 85; // Good pastels
      } else {
        score += 60;
      }
    }
    
    // Reduce vibrant color dominance slightly
    if (color.keywords.includes("vibrant")) {
      score += 85; // Reduced from 100
    }
    
    // Favor jewel tones but less than before
    if (color.keywords.includes("jewel")) {
      score += 75; // Reduced from 80
    }
    
    // Bonus for high vividness (perceptually saturated)
    score += vividness * 45; // Slightly reduced from 50
    
    // Bonus for good saturation levels
    if (s >= 60) {
      score += 35; // Reduced from 40
    } else if (s >= 40) {
      score += 20;
    }
    
    // Lightness sweet spots - boost pastels more
    if (l >= 75 && l <= 90) {
      // Bright pastel range - increased bonus
      score += 40; // Increased from 25
    } else if (l >= 45 && l <= 75) {
      // Good middle lightness range
      score += 25; // Reduced from 30
    }
    
    // Penalize very dark or very desaturated colors
    if (l <= 25 && !color.keywords.includes("jewel")) {
      score -= 30;
    }
    if (s <= 15) {
      score -= 40;
    }
    
    // Prefer specific appealing colors by name patterns
    const appealingNames = [
      'coral', 'turquoise', 'emerald', 'sapphire', 'ruby', 'crimson', 
      'scarlet', 'gold', 'sunflower', 'spring', 'tropical', 'cherry',
      'hibiscus', 'magenta', 'violet', 'rose quartz', 'peach', 'mint',
      'lavender', 'blush', 'sky', 'powder'  // Added more pastel-friendly names
    ];
    
    if (appealingNames.some(name => 
      color.name.toLowerCase().includes(name) || 
      color.keywords.some(kw => kw.toLowerCase().includes(name))
    )) {
      score += 25;
    }
    
    return { color, score };
  });
  
  // Sort by score (highest first)
  const sortedColorData = scoredColors.sort((a, b) => b.score - a.score);
  
  // Select colors while avoiding very similar ones
  const selectedColors: Color[] = [];
  const SIMILARITY_THRESHOLD = 30; // Colors closer than this are considered too similar
  
  for (const colorData of sortedColorData) {
    if (selectedColors.length >= maxColors) break;
    
    const { color } = colorData;
    
    // Check if this color is too similar to any already selected color
    const isTooSimilar = selectedColors.some(selectedColor => 
      calculateColorSimilarity(color.hex, selectedColor.hex) < SIMILARITY_THRESHOLD
    );
    
    if (!isTooSimilar) {
      selectedColors.push(color);
    }
  }
  
  return selectedColors;
}

/**
 * Select the most appealing neutral colors for the end of the rainbow display.
 */
function selectBestNeutrals(colors: Color[], maxColors: number): Color[] {
  if (colors.length === 0) return [];
  
  const scoredColors = colors.map(color => {
    const { s, l } = hexToHsl(color.hex);
    let score = 0;
    
    // Prefer elegant neutrals
    if (color.keywords.includes("light-neutrals")) {
      // Elegant light colors
      if (l >= 85) score += 60;
      else if (l >= 70) score += 40;
    }
    
    if (color.keywords.includes("muted")) {
      score += 35;
    }
    
    // Prefer some contrast variety in neutrals
    if (l >= 80) score += 20; // Lights
    else if (l <= 30) score += 15; // Darks
    else score += 10; // Mediums
    
    // Prefer specific elegant names
    const elegantNames = [
      'pearl', 'silver', 'cream', 'ivory', 'champagne', 'platinum',
      'charcoal', 'graphite', 'sage', 'stone', 'sea glass'
    ];
    
    if (elegantNames.some(name => color.name.toLowerCase().includes(name))) {
      score += 30;
    }
    
    return { color, score };
  });
  
  // Sort by score and take the best neutrals
  const sortedColors = scoredColors
    .sort((a, b) => b.score - a.score)
    .map(item => item.color)
    .slice(0, maxColors);
    
  return sortedColors;
}

export default function ColorDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHue, setSelectedHue] = useState<HueFilter>("all");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordFilter>("all");
  const [selectedTemperature, setSelectedTemperature] = useState<TemperatureFilter>("all");
  const [selectedFamily, setSelectedFamily] = useState<FamilyFilter>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Sort options state
  const [sortBy, setSortBy] = useState<"none" | "lightness" | "saturation">("none");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch colors - use search API if there's a search query, otherwise get all colors
  const { data: allColors = [], isLoading } = useQuery<Color[]>({
    queryKey: debouncedSearch 
      ? [`/api/colors/search?q=${encodeURIComponent(debouncedSearch)}`] 
      : ["/api/colors"],
    enabled: true,
  });

  // Filter colors based on hue, keyword, temperature, and family filters
  // (Search filtering is now handled by the backend API)
  const filteredColors = useMemo(() => {
    let filtered = allColors;

    // Apply hue filter
    if (selectedHue !== "all") {
      filtered = filtered.filter(color => color.hue === selectedHue);
    }

    // Apply keyword filter
    if (selectedKeyword !== "all") {
      filtered = filtered.filter(color => color.keywords.includes(selectedKeyword));
    }

    // Apply temperature filter
    if (selectedTemperature !== "all") {
      filtered = filtered.filter(color => {
        const colorTemperature = classifyColorTemperature(color.hex);
        return colorTemperature === selectedTemperature;
      });
    }

    // Apply family filter
    if (selectedFamily !== "all") {
      filtered = filtered.filter(color => {
        const colorFamily = classifyColorFamily(color.hex);
        return colorFamily === selectedFamily;
      });
    }

    // Apply sorting (if specified)
    if (sortBy !== "none") {
      filtered = [...filtered].sort((a, b) => {
        const aHsl = hexToHsl(a.hex);
        const bHsl = hexToHsl(b.hex);
        
        if (sortBy === "lightness") {
          // Sort lightest → darkest (high to low lightness)
          return bHsl.l - aHsl.l;
        } else if (sortBy === "saturation") {
          // Sort most vivid → least vivid (using HSV-based vividness)
          // Note: We use vividness instead of HSL saturation because HSL.s
          // can be misleadingly high for near-white colors like Snow White
          const aVividness = calculateVividness(a.hex);
          const bVividness = calculateVividness(b.hex);
          return bVividness - aVividness;
        }
        return 0;
      });
    }

    // Sort in ROYGBIV pattern if showing all colors, all styles, and no custom sort
    if (selectedHue === "all" && selectedKeyword === "all" && selectedTemperature === "all" && selectedFamily === "all" && !debouncedSearch && sortBy === "none") {
      const roygbivOrder = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
      
      // Enhanced color selection for beautiful rainbow display
      const roygbivColors: Color[] = [];
      
      roygbivOrder.forEach(hue => {
        const hueColors = filtered.filter(color => color.hue === hue);
        
        // Prioritize vibrant colors and bright pastels for rainbow display
        const selectedColors = selectBestColorsForRainbow(hueColors, 6);
        roygbivColors.push(...selectedColors);
      });
      
      // Add a curated selection of neutrals at the end
      const neutralColors = filtered.filter(color => 
        ["neutral", "white", "black"].includes(color.hue) && 
        !roygbivColors.some(roygbiv => roygbiv.id === color.id)
      );
      const selectedNeutrals = selectBestNeutrals(neutralColors, 12);
      
      // Add any remaining colors after ROYGBIV and neutrals section
      const remainingColors = filtered.filter(color => 
        !roygbivColors.some(roygbiv => roygbiv.id === color.id) &&
        !selectedNeutrals.some(neutral => neutral.id === color.id)
      );
      
      return [...roygbivColors, ...selectedNeutrals, ...remainingColors];
    }

    return filtered;
  }, [allColors, debouncedSearch, selectedHue, selectedKeyword, selectedTemperature, selectedFamily, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-2xl">
              🎨
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-tight" data-testid="text-app-title">
                The Ultimate Brand Color Database
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Discover and copy 600+ curated brand colors
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span data-testid="text-total-colors">
                {filteredColors.length} colors
              </span>
              <span className="text-border">•</span>
              <span>Click any color to copy</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="md:sticky md:top-16 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <ColorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedHue={selectedHue}
            onHueChange={setSelectedHue}
            selectedKeyword={selectedKeyword}
            onKeywordChange={setSelectedKeyword}
            selectedTemperature={selectedTemperature}
            onTemperatureChange={setSelectedTemperature}
            selectedFamily={selectedFamily}
            onFamilyChange={setSelectedFamily}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <ColorGrid 
          colors={filteredColors} 
          isLoading={isLoading}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Brand Color Database - Find perfect colors for your projects
            </p>
            <p className="text-xs text-muted-foreground">
              All colors are carefully curated for design and branding use
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}