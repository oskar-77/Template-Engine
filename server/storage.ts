import { db } from "./db";
import {
  templates,
  type InsertTemplate,
  type Template,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
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
}

export const storage = new DatabaseStorage();
