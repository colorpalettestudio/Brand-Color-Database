import ColorSwatch from "./ColorSwatch";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Sun, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Color } from "@shared/schema";

interface ColorGridProps {
  colors: Color[];
  isLoading?: boolean;
  sortBy: "none" | "lightness" | "saturation";
  onSortByChange: (sortBy: "none" | "lightness" | "saturation") => void;
}

export default function ColorGrid({ colors, isLoading = false, sortBy, onSortByChange }: ColorGridProps) {
  const gridClasses = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4";

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className={gridClasses}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="w-24 h-24 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-lg mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No colors found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search criteria or filters to find the colors you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-color-count">
            {colors.length} colors
          </h2>
        </div>
        
        {/* Sort options */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === "none" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortByChange("none")}
            className={cn(
              sortBy === "none" && "bg-foreground text-background hover:bg-foreground/90"
            )}
            data-testid="sort-none"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Default
          </Button>
          <Button
            variant={sortBy === "lightness" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortByChange("lightness")}
            className={cn(
              sortBy === "lightness" && "bg-foreground text-background hover:bg-foreground/90"
            )}
            data-testid="sort-lightness"
          >
            <Sun className="w-3 h-3 mr-1" />
            Lightness
          </Button>
          <Button
            variant={sortBy === "saturation" ? "default" : "outline"}
            size="sm"
            onClick={() => onSortByChange("saturation")}
            className={cn(
              sortBy === "saturation" && "bg-foreground text-background hover:bg-foreground/90"
            )}
            data-testid="sort-saturation"
          >
            <Droplets className="w-3 h-3 mr-1" />
            Saturation
          </Button>
        </div>
      </div>

      {/* Color grid */}
      <div className={cn(gridClasses)} data-testid="grid-colors">
        {colors.map((color) => (
          <ColorSwatch
            key={color.id}
            color={color}
            size="md"
            showInfo={true}
          />
        ))}
      </div>
    </div>
  );
}