import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Color } from "@shared/schema";

interface ColorSwatchProps {
  color: Color;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
}

export default function ColorSwatch({ color, size = "md", showInfo = true }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    let success = false;
    
    // Try modern clipboard API first (this should work in most modern browsers)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(color.hex);
        success = true;
        console.log('Used modern clipboard API'); // Debug
      } catch (error) {
        console.log('Modern clipboard failed, using fallback:', error); // Debug
        // Fallback to legacy method
        success = fallbackCopyToClipboard(color.hex);
      }
    } else {
      console.log('Using fallback - no modern clipboard API or insecure context'); // Debug
      // Use fallback for older browsers or insecure contexts
      success = fallbackCopyToClipboard(color.hex);
    }
    
    if (success) {
      setCopied(true);
      toast({
        title: "Color copied!",
        description: `${color.hex} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const fallbackCopyToClipboard = (text: string): boolean => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Position it completely out of view and make it invisible
      textarea.style.cssText = `
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        boxShadow: none !important;
        background: transparent !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
        user-select: text !important;
      `;
      
      textarea.setAttribute('readonly', 'true');
      textarea.setAttribute('aria-hidden', 'true');
      textarea.setAttribute('tabindex', '-1');
      
      document.body.appendChild(textarea);
      
      // Focus without scrolling and select text
      textarea.focus({ preventScroll: true });
      textarea.select();
      
      // Try to copy using execCommand
      const successful = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textarea);
      
      return successful;
    } catch (error) {
      return false;
    }
  };

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Determine if the color is light or dark for text contrast
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getBrightness = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  };

  const isLight = getBrightness(color.hex) > 155;
  const textColor = isLight ? "text-black" : "text-white";
  const overlayBg = isLight ? "bg-black/10" : "bg-white/10";

  return (
    <div className="group relative">
      {/* Color swatch */}
      <div
        className={cn(
          "relative rounded-lg cursor-pointer hover-elevate active-elevate-2 overflow-hidden border border-border",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color.hex }}
        onClick={copyToClipboard}
        onMouseDown={(e) => e.preventDefault()} // Prevent incidental focus shifts
        data-testid={`swatch-${color.id}`}
      >
        {/* Hover overlay with copy icon */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          overlayBg
        )}>
          {copied ? (
            <Check className={cn("w-6 h-6", textColor)} />
          ) : (
            <Copy className={cn("w-6 h-6", textColor)} />
          )}
        </div>
        
        {/* Hex code overlay on hover */}
        <div className={cn(
          "absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          textColor,
          textSizeClasses[size]
        )}>
          <div className={cn(
            "rounded px-1 py-0.5 font-mono",
            isLight ? "bg-black/20" : "bg-white/20"
          )}>
            {color.hex}
          </div>
        </div>
      </div>

      {/* Color info */}
      {showInfo && (
        <div className="mt-2 space-y-1">
          <p className={cn("font-medium text-foreground truncate", textSizeClasses[size])} data-testid={`name-${color.id}`}>
            {color.name}
          </p>
          <p className={cn("font-mono text-muted-foreground", textSizeClasses[size])} data-testid={`hex-${color.id}`}>
            {color.hex}
          </p>
        </div>
      )}
    </div>
  );
}