import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ColorFilters from "@/components/ColorFilters";
import ColorGrid from "@/components/ColorGrid";
import ThemeToggle from "@/components/ThemeToggle";
import ImportExport from "@/components/ImportExport";
import { Palette } from "lucide-react";
import type { Color, HueFilter, KeywordFilter } from "@shared/schema";

export default function ColorDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHue, setSelectedHue] = useState<HueFilter>("all");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordFilter>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all colors
  const { data: allColors = [], isLoading } = useQuery<Color[]>({
    queryKey: ["/api/colors"],
    enabled: true,
  });

  // Filter colors based on current filters
  const filteredColors = useMemo(() => {
    let filtered = allColors;

    // Apply search filter
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter(color =>
        color.name.toLowerCase().includes(lowerSearch) ||
        color.hex.toLowerCase().includes(lowerSearch) ||
        color.hue.toLowerCase().includes(lowerSearch) ||
        color.keywords.some(keyword => keyword.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply hue filter
    if (selectedHue !== "all") {
      filtered = filtered.filter(color => color.hue === selectedHue);
    }

    // Apply keyword filter
    if (selectedKeyword !== "all") {
      filtered = filtered.filter(color => color.keywords.includes(selectedKeyword));
    }

    return filtered;
  }, [allColors, debouncedSearch, selectedHue, selectedKeyword]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
                Brand Color Database
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
      <div className="sticky top-16 z-40 bg-background border-b border-border">
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
        <ColorGrid colors={filteredColors} isLoading={isLoading} />
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