import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Search, X, Sun, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HueFilter, KeywordFilter } from "@shared/schema";

interface ColorFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedHue: HueFilter;
  onHueChange: (hue: HueFilter) => void;
  selectedKeyword: KeywordFilter;
  onKeywordChange: (keyword: KeywordFilter) => void;
  sliderMode: "lightness" | "saturation";
  onSliderModeChange: (mode: "lightness" | "saturation") => void;
  sliderRange: [number, number];
  onSliderRangeChange: (range: [number, number]) => void;
}

const hueOptions: { value: HueFilter; label: string; color: string }[] = [
  { value: "all", label: "All Colors", color: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "yellow", label: "Yellow", color: "bg-yellow-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
  { value: "neutral", label: "Neutral", color: "bg-gray-500" },
  { value: "white", label: "White", color: "bg-white" },
  { value: "black", label: "Black", color: "bg-black" },
];

const keywordOptions: { value: KeywordFilter; label: string }[] = [
  { value: "all", label: "All Styles" },
  { value: "light-neutrals", label: "Light Neutrals" },
  { value: "dark-neutrals", label: "Dark Neutrals" },
  { value: "pastel", label: "Pastel" },
  { value: "muted", label: "Muted" },
  { value: "jewel", label: "Jewel Tones" },
  { value: "vibrant", label: "Vibrant" },
  { value: "earthy", label: "Earthy" },
];

export default function ColorFilters({
  searchQuery,
  onSearchChange,
  selectedHue,
  onHueChange,
  selectedKeyword,
  onKeywordChange,
  sliderMode,
  onSliderModeChange,
  sliderRange,
  onSliderRangeChange,
}: ColorFiltersProps) {
  const clearSearch = () => onSearchChange("");

  return (
    <div className="space-y-6 p-6 bg-card border-b border-border">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="search"
          placeholder="Search colors by name or hex..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
          data-testid="input-search"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Hue Filters */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Filter by Hue</h3>
          <div className="flex flex-wrap gap-2">
            {hueOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedHue === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onHueChange(option.value)}
                className={cn(
                  "relative overflow-hidden",
                  selectedHue === option.value && "bg-foreground text-background hover:bg-foreground/90"
                )}
                data-testid={`filter-hue-${option.value}`}
              >
                <div className={cn("absolute inset-0", option.color, "opacity-20")} />
                <span className="relative z-10">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Keyword Filters */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Filter by Style</h3>
          <div className="flex flex-wrap gap-2">
            {keywordOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedKeyword === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onKeywordChange(option.value)}
                className={cn(
                  selectedKeyword === option.value && "bg-foreground text-background hover:bg-foreground/90"
                )}
                data-testid={`filter-keyword-${option.value}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Lightness/Saturation Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Filter by {sliderMode === "lightness" ? "Lightness" : "Saturation"}
            </h3>
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant={sliderMode === "lightness" ? "default" : "ghost"}
                size="sm"
                onClick={() => onSliderModeChange("lightness")}
                className="h-8 px-3 text-xs"
                data-testid="button-slider-lightness"
              >
                <Sun className="w-3 h-3 mr-1" />
                Lightness
              </Button>
              <Button
                variant={sliderMode === "saturation" ? "default" : "ghost"}
                size="sm"
                onClick={() => onSliderModeChange("saturation")}
                className="h-8 px-3 text-xs"
                data-testid="button-slider-saturation"
              >
                <Droplets className="w-3 h-3 mr-1" />
                Saturation
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={sliderRange}
              onValueChange={onSliderRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
              data-testid="slider-range"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {sliderMode === "lightness" ? "Darkest" : "Muted"} ({sliderRange[0]}%)
              </span>
              <span>
                {sliderMode === "lightness" ? "Lightest" : "Vibrant"} ({sliderRange[1]}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedHue !== "all" || selectedKeyword !== "all" || searchQuery || sliderRange[0] > 0 || sliderRange[1] < 100) && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedHue !== "all" && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {hueOptions.find(h => h.value === selectedHue)?.label}
            </span>
          )}
          {selectedKeyword !== "all" && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {keywordOptions.find(k => k.value === selectedKeyword)?.label}
            </span>
          )}
          {(sliderRange[0] > 0 || sliderRange[1] < 100) && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {sliderMode === "lightness" ? "Lightness" : "Saturation"}: {sliderRange[0]}%-{sliderRange[1]}%
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              "{searchQuery}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}