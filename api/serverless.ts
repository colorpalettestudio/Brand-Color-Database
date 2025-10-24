import express, { type Request, Response, NextFunction } from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Create Express app instance
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import storage dynamically to avoid build issues
let storage: any;
let insertColorSchema: any;
let z: any;

async function initializeDependencies() {
  if (!storage) {
    const storageModule = await import("../server/storage.js");
    storage = storageModule.storage;
    
    const schemaModule = await import("../shared/schema.js");
    insertColorSchema = schemaModule.insertColorSchema;
    
    const zodModule = await import("zod");
    z = zodModule.z;
  }
}

// Register routes inline for serverless
async function setupRoutes() {
  await initializeDependencies();

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
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
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
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
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
      const createdColors = await storage.bulkCreateColors(colors);
      res.status(201).json({
        message: `Successfully imported ${createdColors.length} colors`,
        colors: createdColors,
      });
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to bulk import colors" });
      }
    }
  });

  // Export colors (all or by filter)
  app.get("/api/colors/export", async (req, res) => {
    try {
      const colors = await storage.getAllColors();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=colors.json");
      res.json(colors);
    } catch (error) {
      res.status(500).json({ error: "Failed to export colors" });
    }
  });

  // Replace all colors (dangerous operation)
  app.post("/api/colors/replace", async (req, res) => {
    try {
      const bulkSchema = z.object({
        colors: z.array(insertColorSchema).max(1000, "Maximum 1000 colors per replacement"),
      });
      
      const { colors } = bulkSchema.parse(req.body);
      const replacedColors = await storage.replaceAllColors(colors);
      res.status(200).json({
        message: `Successfully replaced all colors with ${replacedColors.length} new colors`,
        colors: replacedColors,
      });
    } catch (error: any) {
      if (error.constructor.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to replace colors" });
      }
    }
  });

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
}

// Initialize once
let initialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!initialized) {
    await setupRoutes();
    initialized = true;
  }
  
  // Handle the request with Express
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
