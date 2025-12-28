import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(), // Can be a data URI for uploaded images or a path for presets
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type CreateTemplateRequest = InsertTemplate;
export type TemplateResponse = Template;
export type TemplatesListResponse = Template[];
