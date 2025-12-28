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

  app.patch(api.templates.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.templates.update.input.parse(req.body);
      const template = await storage.updateTemplate(id, input);
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
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

  return httpServer;
}

export async function seedDatabase() {
  const existing = await storage.getTemplates();
  if (existing.length === 0) {
    const presets = [
      { name: "Sphere", imageUrl: "preset:sphere", isCustom: false, displayText: "Molecular Sphere", primaryColor: "#00ffcc", secondaryColor: "#7700ff", scale: 1.0 },
      { name: "Cube", imageUrl: "preset:grid", isCustom: false, displayText: "Grid Structure", primaryColor: "#ff0066", secondaryColor: "#00ffcc", scale: 1.0 },
      { name: "DNA", imageUrl: "preset:helix", isCustom: false, displayText: "Genetic Code", primaryColor: "#7700ff", secondaryColor: "#ff0066", scale: 1.0 },
      { name: "Galaxy", imageUrl: "preset:galaxy", isCustom: false, displayText: "Cosmic Particles", primaryColor: "#00ffcc", secondaryColor: "#ff0066", scale: 1.5 },
      { name: "Heart", imageUrl: "preset:heart", isCustom: false, displayText: "Core Pulse", primaryColor: "#ff0066", secondaryColor: "#7700ff", scale: 1.2 },
    ];
    
    for (const p of presets) {
      await storage.createTemplate(p);
    }
  }
}
