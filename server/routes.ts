import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertColorSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all colors
  app.get("/api/colors", async (req, res) => {
    try {
      const colors = await storage.getAllColors();
      res.json(colors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch colors" });
    }
  });

  // Filter colors by hue
  app.get("/api/colors/hue/:hue", async (req, res) => {
    try {
      const { hue } = req.params;
      const colors = await storage.getColorsByHue(hue);
      res.json(colors);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter colors by hue" });
    }
  });

  // Filter colors by keyword
  app.get("/api/colors/keyword/:keyword", async (req, res) => {
    try {
      const { keyword } = req.params;
      const colors = await storage.getColorsByKeyword(keyword);
      res.json(colors);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter colors by keyword" });
    }
  });

  // Search colors
  app.get("/api/colors/search", async (req, res) => {
    try {
      const searchSchema = z.object({
        q: z.string().min(1, "Search query is required"),
      });
      
      const { q } = searchSchema.parse(req.query);
      const colors = await storage.searchColors(q);
      res.json(colors);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to search colors" });
      }
    }
  });

  // Add single color
  app.post("/api/colors", async (req, res) => {
    try {
      const colorData = insertColorSchema.parse(req.body);
      const color = await storage.createColor(colorData);
      res.status(201).json(color);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create color" });
      }
    }
  });

  // Bulk import colors
  app.post("/api/colors/bulk", async (req, res) => {
    try {
      const bulkSchema = z.object({
        colors: z.array(insertColorSchema).max(1000, "Maximum 1000 colors per bulk import"),
      });
      
      const { colors } = bulkSchema.parse(req.body);
      const createdColors = [];
      
      for (const colorData of colors) {
        const color = await storage.createColor(colorData);
        createdColors.push(color);
      }
      
      res.status(201).json({ 
        message: `Successfully imported ${createdColors.length} colors`,
        colors: createdColors 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to bulk import colors" });
      }
    }
  });

  // Export all colors
  app.get("/api/colors/export", async (req, res) => {
    try {
      const colors = await storage.getAllColors();
      const exportData = colors.map(({ id, ...colorData }) => colorData);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="colors-export.json"');
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export colors" });
    }
  });

  // Replace all colors (full import)
  app.put("/api/colors", async (req, res) => {
    try {
      const bulkSchema = z.object({
        colors: z.array(insertColorSchema).max(2000, "Maximum 2000 colors total"),
      });
      
      const { colors } = bulkSchema.parse(req.body);
      await storage.replaceAllColors(colors);
      
      res.json({ 
        message: `Successfully replaced database with ${colors.length} colors` 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to replace colors" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}