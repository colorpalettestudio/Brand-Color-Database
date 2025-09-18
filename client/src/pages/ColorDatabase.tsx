import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ColorFilters from "@/components/ColorFilters";
import ColorGrid from "@/components/ColorGrid";
import ThemeToggle from "@/components/ThemeToggle";
import ImportExport from "@/components/ImportExport";
import { Palette } from "lucide-react";
import type { Color, HueFilter, KeywordFilter } from "@shared/schema";
import { hexToHsl } from "@shared/schema";

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

export default function ColorDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHue, setSelectedHue] = useState<HueFilter>("all");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordFilter>("all");
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

  // Filter colors based on hue and keyword filters only
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
    if (selectedHue === "all" && selectedKeyword === "all" && !debouncedSearch && sortBy === "none") {
      const roygbivOrder = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "neutral", "white", "black"];
      
      // Take first ~5 colors from each hue category for ROYGBIV pattern
      const roygbivColors: Color[] = [];
      roygbivOrder.forEach(hue => {
        const hueColors = filtered.filter(color => color.hue === hue).slice(0, 5);
        roygbivColors.push(...hueColors);
      });
      
      // Add remaining colors after ROYGBIV section
      const remainingColors = filtered.filter(color => 
        !roygbivColors.some(roygbiv => roygbiv.id === color.id)
      );
      
      return [...roygbivColors, ...remainingColors];
    }

    return filtered;
  }, [allColors, debouncedSearch, selectedHue, selectedKeyword, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight" data-testid="text-app-title">
                <span className="block sm:inline">Brand Color</span>
                <span className="block sm:inline sm:ml-1">Database</span>
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Discover and copy 600+ curated brand colors
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span data-testid="text-total-colors">
                {allColors.length} colors
              </span>
              <span className="text-border">•</span>
              <span>Click any color to copy</span>
            </div>
            <ImportExport />
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