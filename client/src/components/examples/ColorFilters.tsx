import { useState } from 'react';
import ColorFilters from '../ColorFilters';
import type { HueFilter, KeywordFilter } from '@shared/schema';

export default function ColorFiltersExample() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHue, setSelectedHue] = useState<HueFilter>("all");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordFilter>("all");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Color Filters</h3>
      <div className="border border-border rounded-lg">
        <ColorFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedHue={selectedHue}
          onHueChange={setSelectedHue}
          selectedKeyword={selectedKeyword}
          onKeywordChange={setSelectedKeyword}
        />
      </div>
      
      {/* Display current filter state */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Current Filter State:</h4>
        <ul className="space-y-1 text-sm">
          <li>Search: "{searchQuery || 'None'}"</li>
          <li>Hue: {selectedHue}</li>
          <li>Keyword: {selectedKeyword}</li>
        </ul>
      </div>
    </div>
  );
}