import { pgTable, text, serial, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(), 
  isCustom: boolean("is_custom").default(false),
  displayText: text("display_text"), // For on-screen text
  primaryColor: text("primary_color").default("#00ffcc"), // Cyan default
  secondaryColor: text("secondary_color").default("#ff0066"), // Pink default
  scale: real("scale").default(1.0), // For zooming in/out
  createdAt: timestamp("created_at").defaultNow(),
});

export const shapeDescriptions = pgTable("shape_descriptions", {
  id: serial("id").primaryKey(),
  shapeId: text("shape_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true });
export const insertShapeDescriptionSchema = createInsertSchema(shapeDescriptions).omit({ id: true, updatedAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type ShapeDescription = typeof shapeDescriptions.$inferSelect;
export type InsertShapeDescription = z.infer<typeof insertShapeDescriptionSchema>;

export type CreateTemplateRequest = InsertTemplate;
export type TemplateResponse = Template;
export type TemplatesListResponse = Template[];
export type ShapeDescriptionResponse = ShapeDescription;
export type ShapeDescriptionsListResponse = ShapeDescription[];
