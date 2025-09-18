import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HueFilter, KeywordFilter, TemperatureFilter, FamilyFilter } from "@shared/schema";

interface ColorFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedHue: HueFilter;
  onHueChange: (hue: HueFilter) => void;
  selectedKeyword: KeywordFilter;
  onKeywordChange: (keyword: KeywordFilter) => void;
  selectedTemperature: TemperatureFilter;
  onTemperatureChange: (value: TemperatureFilter) => void;
  selectedFamily: FamilyFilter;
  onFamilyChange: (value: FamilyFilter) => void;
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

const temperatureOptions: { value: TemperatureFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "warm", label: "Warm" },
  { value: "cool", label: "Cool" },
  { value: "neutral", label: "Neutral" },
];

const familyOptions: { value: FamilyFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "teal", label: "Teal" },
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
  { value: "indigo", label: "Indigo" },
  { value: "violet", label: "Violet" },
  { value: "magenta", label: "Magenta" },
  { value: "pink", label: "Pink" },
  { value: "brown", label: "Brown" },
  { value: "gray", label: "Gray" },
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
];

export default function ColorFilters({
  searchQuery,
  onSearchChange,
  selectedHue,
  onHueChange,
  selectedKeyword,
  onKeywordChange,
  selectedTemperature,
  onTemperatureChange,
  selectedFamily,
  onFamilyChange,
}: ColorFiltersProps) {
  const clearSearch = () => onSearchChange("");

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-card border-b border-border">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
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
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            data-testid="button-clear-search"
          >
            <X className="h-3 w-3" />
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
                  "relative",
                  selectedHue === option.value && "bg-foreground text-background hover:bg-foreground/90"
                )}
                data-testid={`filter-hue-${option.value}`}
              >
                {selectedHue !== option.value && (
                  <div className={cn("absolute left-0 top-1 bottom-1 w-1 rounded-r-sm", option.color)} />
                )}
                {option.label}
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

        {/* Advanced Filters */}
        <Accordion type="single" collapsible className="border border-border rounded-md">
          <AccordionItem value="advanced-filters" className="border-none">
            <AccordionTrigger 
              className="px-4 py-3 text-sm font-medium text-foreground hover:no-underline"
              data-testid="accordion-trigger-advanced-filters"
            >
              Advanced filters
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Temperature Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Temperature</Label>
                  <RadioGroup 
                    value={selectedTemperature} 
                    onValueChange={onTemperatureChange}
                    className="flex flex-wrap gap-4"
                    data-testid="radio-group-temperature"
                  >
                    {temperatureOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option.value} 
                          id={`temperature-${option.value}`}
                          data-testid={`radio-temperature-${option.value}`}
                        />
                        <Label 
                          htmlFor={`temperature-${option.value}`} 
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Color Family Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Color Family</Label>
                  <Select 
                    value={selectedFamily} 
                    onValueChange={onFamilyChange}
                  >
                    <SelectTrigger 
                      className="w-full max-w-xs"
                      data-testid="select-trigger-family"
                    >
                      <SelectValue placeholder="Select a color family" />
                    </SelectTrigger>
                    <SelectContent data-testid="select-content-family">
                      {familyOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          data-testid={`select-item-family-${option.value}`}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>

      {/* Active Filters Summary */}
      {(selectedHue !== "all" || selectedKeyword !== "all" || selectedTemperature !== "all" || selectedFamily !== "all" || searchQuery) && (
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
          {selectedTemperature !== "all" && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {temperatureOptions.find(t => t.value === selectedTemperature)?.label}
            </span>
          )}
          {selectedFamily !== "all" && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {familyOptions.find(f => f.value === selectedFamily)?.label}
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