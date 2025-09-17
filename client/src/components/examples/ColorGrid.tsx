import ColorGrid from '../ColorGrid';

export default function ColorGridExample() {
  // todo: remove mock functionality
  const mockColors = [
    { id: "1", name: "Ocean Blue", hex: "#006994", hue: "blue", keywords: ["vibrant", "deep"] },
    { id: "2", name: "Sunset Orange", hex: "#FF4500", hue: "orange", keywords: ["vibrant", "warm"] },
    { id: "3", name: "Forest Green", hex: "#228B22", hue: "green", keywords: ["dark", "muted"] },
    { id: "4", name: "Lavender", hex: "#E6E6FA", hue: "purple", keywords: ["pastel", "light"] },
    { id: "5", name: "Cherry Red", hex: "#D2001C", hue: "red", keywords: ["vibrant", "bold"] },
    { id: "6", name: "Lemon Yellow", hex: "#FFF700", hue: "yellow", keywords: ["vibrant", "light"] },
    { id: "7", name: "Rose Pink", hex: "#FF66CC", hue: "pink", keywords: ["pastel", "light"] },
    { id: "8", name: "Charcoal", hex: "#36454F", hue: "neutral", keywords: ["dark", "muted"] },
    { id: "9", name: "Sky Blue", hex: "#87CEEB", hue: "blue", keywords: ["light", "pastel"] },
    { id: "10", name: "Mint Green", hex: "#98FB98", hue: "green", keywords: ["pastel", "light"] },
    { id: "11", name: "Coral", hex: "#FF7F7F", hue: "red", keywords: ["light", "warm"] },
    { id: "12", name: "Gold", hex: "#FFD700", hue: "yellow", keywords: ["vibrant", "warm"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Color Grid - Normal State</h3>
        <div className="border border-border rounded-lg">
          <ColorGrid colors={mockColors} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Color Grid - Loading State</h3>
        <div className="border border-border rounded-lg">
          <ColorGrid colors={[]} isLoading={true} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Color Grid - Empty State</h3>
        <div className="border border-border rounded-lg">
          <ColorGrid colors={[]} />
        </div>
      </div>
    </div>
  );
}