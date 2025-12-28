import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import express from 'express';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Increase payload size for image uploads (base64)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get(api.templates.list.path, async (req, res) => {
    const templates = await storage.getTemplates();
    res.json(templates);
  });

  app.post(api.templates.create.path, async (req, res) => {
    try {
      const input = api.templates.create.input.parse(req.body);
      const template = await storage.createTemplate(input);
      res.status(201).json(template);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.templates.delete.path, async (req, res) => {
    await storage.deleteTemplate(Number(req.params.id));
    res.status(204).send();
  });

  // Initialize default templates
  await seedDatabase();

  return httpServer;
}

// Seed function to add default templates
export async function seedDatabase() {
  const existing = await storage.getTemplates();
  if (existing.length === 0) {
    const presets = [
      { name: "Sphere", imageUrl: "preset:sphere", isCustom: false },
      { name: "Cube", imageUrl: "preset:grid", isCustom: false },
      { name: "DNA", imageUrl: "preset:helix", isCustom: false },
      { name: "Torus", imageUrl: "preset:torus", isCustom: false },
      { name: "Wave", imageUrl: "preset:wave", isCustom: false },
      { name: "Pyramid", imageUrl: "preset:pyramid", isCustom: false },
      { name: "Galaxy", imageUrl: "preset:galaxy", isCustom: false },
      { name: "Heart", imageUrl: "preset:heart", isCustom: false },
      { name: "Flower", imageUrl: "preset:flower", isCustom: false },
      { name: "Fountain", imageUrl: "preset:fountain", isCustom: false },
      { name: "Spiral", imageUrl: "preset:spiral", isCustom: false },
    ];
    
    for (const p of presets) {
      await storage.createTemplate(p);
    }
  }
}
