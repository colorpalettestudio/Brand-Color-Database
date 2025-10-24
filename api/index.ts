import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MemStorage } from "../server/storage";
import { insertColorSchema } from "../shared/schema";
import { z } from "zod";

// Initialize storage once
let storage: MemStorage | null = null;

function getStorage(): MemStorage {
  if (!storage) {
    storage = new MemStorage();
  }
  return storage;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.split('?')[0] || '';
  
  try {
    const store = getStorage();

    // GET /api/colors - Get all colors
    if (method === 'GET' && path === '/api/colors') {
      const colors = await store.getAllColors();
      return res.status(200).json(colors);
    }

    // GET /api/colors/hue/:hue - Filter by hue
    if (method === 'GET' && path.startsWith('/api/colors/hue/')) {
      const hue = path.split('/api/colors/hue/')[1];
      const colors = await store.getColorsByHue(hue);
      return res.status(200).json(colors);
    }

    // GET /api/colors/keyword/:keyword - Filter by keyword
    if (method === 'GET' && path.startsWith('/api/colors/keyword/')) {
      const keyword = path.split('/api/colors/keyword/')[1];
      const colors = await store.getColorsByKeyword(keyword);
      return res.status(200).json(colors);
    }

    // GET /api/colors/search?q=query - Search colors
    if (method === 'GET' && path === '/api/colors/search') {
      const q = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const colors = await store.searchColors(q);
      return res.status(200).json(colors);
    }

    // GET /api/colors/export - Export colors
    if (method === 'GET' && path === '/api/colors/export') {
      const colors = await store.getAllColors();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=colors.json');
      return res.status(200).json(colors);
    }

    // POST /api/colors - Create single color
    if (method === 'POST' && path === '/api/colors') {
      try {
        const colorData = insertColorSchema.parse(req.body);
        const color = await store.createColor(colorData);
        return res.status(201).json(color);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        throw error;
      }
    }

    // POST /api/colors/bulk - Bulk import
    if (method === 'POST' && path === '/api/colors/bulk') {
      try {
        const bulkSchema = z.object({
          colors: z.array(insertColorSchema).max(1000, 'Maximum 1000 colors per bulk import'),
        });
        
        const { colors } = bulkSchema.parse(req.body);
        
        // Create colors one by one
        const createdColors = await Promise.all(
          colors.map(colorData => store.createColor(colorData))
        );
        
        return res.status(201).json({
          message: `Successfully imported ${createdColors.length} colors`,
          colors: createdColors,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        throw error;
      }
    }

    // POST /api/colors/replace - Replace all colors
    if (method === 'POST' && path === '/api/colors/replace') {
      try {
        const bulkSchema = z.object({
          colors: z.array(insertColorSchema).max(1000, 'Maximum 1000 colors per replacement'),
        });
        
        const { colors } = bulkSchema.parse(req.body);
        await store.replaceAllColors(colors);
        return res.status(200).json({
          message: `Successfully replaced all colors with ${colors.length} new colors`,
          colors,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors });
        }
        throw error;
      }
    }

    // Route not found
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error'
    });
  }
}
