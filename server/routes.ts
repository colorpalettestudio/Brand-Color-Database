import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}