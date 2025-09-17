import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Theme Toggle</h3>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Toggle between light and dark mode:</span>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground">
        Click the icon to switch themes. The preference will be saved locally.
      </p>
    </div>
  );
}