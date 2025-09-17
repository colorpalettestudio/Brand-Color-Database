import ColorSwatch from '../ColorSwatch'

export default function ColorSwatchExample() {
  const exampleColor = {
    id: "1",
    name: "Ocean Blue", 
    hex: "#006994",
    hue: "blue",
    keywords: ["vibrant", "deep"]
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Color Swatch Sizes</h3>
        <div className="flex items-end gap-6">
          <ColorSwatch color={exampleColor} size="sm" />
          <ColorSwatch color={exampleColor} size="md" />
          <ColorSwatch color={exampleColor} size="lg" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Different Colors</h3>
        <div className="flex gap-4">
          <ColorSwatch color={{...exampleColor, name: "Sunset Orange", hex: "#FF4500", hue: "orange", keywords: ["vibrant", "warm"]}} />
          <ColorSwatch color={{...exampleColor, name: "Forest Green", hex: "#228B22", hue: "green", keywords: ["dark", "muted"]}} />
          <ColorSwatch color={{...exampleColor, name: "Lavender", hex: "#E6E6FA", hue: "purple", keywords: ["pastel", "light"]}} />
        </div>
      </div>
    </div>
  );
}