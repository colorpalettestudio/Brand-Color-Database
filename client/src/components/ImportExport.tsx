import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { InsertColor } from "@shared/schema";

interface ImportExportProps {
  className?: string;
}

export default function ImportExport({ className }: ImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/colors/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "brand-colors-export.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Color database exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export color database",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("json")) {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const colors = JSON.parse(text) as InsertColor[];
      
      if (!Array.isArray(colors)) {
        throw new Error("Invalid format");
      }

      // Validate the first few colors have required fields
      const sampleColor = colors[0];
      if (!sampleColor?.name || !sampleColor?.hex || !sampleColor?.hue) {
        throw new Error("Invalid color format");
      }

      await apiRequest("/api/colors/bulk", {
        method: "POST",
        body: { colors },
      });

      // Invalidate and refetch colors
      await queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${colors.length} colors`,
      });
      
      setShowImport(false);
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Could not import colors",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleReplace = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "This will replace ALL colors in the database. Are you sure you want to continue?"
    );
    if (!confirmed) {
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const colors = JSON.parse(text) as InsertColor[];
      
      if (!Array.isArray(colors)) {
        throw new Error("Invalid format");
      }

      await apiRequest("/api/colors", {
        method: "PUT",
        body: { colors },
      });

      // Invalidate and refetch colors
      await queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      
      toast({
        title: "Database replaced",
        description: `Successfully replaced database with ${colors.length} colors`,
      });
      
      setShowImport(false);
    } catch (error) {
      toast({
        title: "Replace failed",
        description: error instanceof Error ? error.message : "Could not replace colors",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  if (showImport) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-card">
          <label className="flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Add Colors</span>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
              data-testid="input-import-file"
            />
          </label>
          
          <span className="text-muted-foreground">|</span>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-destructive">Replace All</span>
            <Input
              type="file"
              accept=".json"
              onChange={handleReplace}
              disabled={isImporting}
              className="hidden"
              data-testid="input-replace-file"
            />
          </label>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImport(false)}
            className="h-6 w-6 p-0"
            data-testid="button-close-import"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
        data-testid="button-export"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowImport(true)}
        disabled={isImporting}
        data-testid="button-import"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
    </div>
  );
}