import { useState } from "react";
import ColorSwatch from "./ColorSwatch";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Color } from "@shared/schema";

interface ColorGridProps {
  colors: Color[];
  isLoading?: boolean;
}

export default function ColorGrid({ colors, isLoading = false }: ColorGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const gridClasses = {
    grid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4",
    list: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
  };

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
        <div className={gridClasses.grid}>
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
        
        {/* View mode toggle */}
        <div className="flex gap-1 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="w-9 h-7 p-0"
            data-testid="button-view-grid"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="w-9 h-7 p-0"
            data-testid="button-view-list"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Color grid */}
      <div className={cn(gridClasses[viewMode])} data-testid="grid-colors">
        {colors.map((color) => (
          <ColorSwatch
            key={color.id}
            color={color}
            size={viewMode === "grid" ? "md" : "lg"}
            showInfo={true}
          />
        ))}
      </div>
    </div>
  );
}