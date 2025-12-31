import { db } from "./db";
import {
  templates,
  shapeDescriptions,
  type InsertTemplate,
  type Template,
  type ShapeDescription,
  type InsertShapeDescription,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
  getShapeDescriptions(): Promise<ShapeDescription[]>;
  getShapeDescription(shapeId: string): Promise<ShapeDescription | undefined>;
  upsertShapeDescription(desc: InsertShapeDescription): Promise<ShapeDescription>;
}

export class DatabaseStorage implements IStorage {
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(templates.createdAt);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: number, updates: Partial<InsertTemplate>): Promise<Template> {
    const [updated] = await db
      .update(templates)
      .set(updates)
      .where(eq(templates.id, id))
      .returning();
    if (!updated) throw new Error("Template not found");
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  async getShapeDescriptions(): Promise<ShapeDescription[]> {
    return await db.select().from(shapeDescriptions);
  }

  async getShapeDescription(shapeId: string): Promise<ShapeDescription | undefined> {
    const result = await db.select().from(shapeDescriptions).where(eq(shapeDescriptions.shapeId, shapeId));
    return result[0];
  }

  async upsertShapeDescription(desc: InsertShapeDescription): Promise<ShapeDescription> {
    const existing = await this.getShapeDescription(desc.shapeId);
    if (existing) {
      const [updated] = await db
        .update(shapeDescriptions)
        .set({ title: desc.title, description: desc.description, updatedAt: new Date() })
        .where(eq(shapeDescriptions.shapeId, desc.shapeId))
        .returning();
      return updated;
    } else {
      const [inserted] = await db
        .insert(shapeDescriptions)
        .values(desc)
        .returning();
      return inserted;
    }
  }
}

export const storage = new DatabaseStorage();
