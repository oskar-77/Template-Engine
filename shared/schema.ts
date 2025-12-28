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

// === BASE SCHEMAS ===
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type CreateTemplateRequest = InsertTemplate;
export type TemplateResponse = Template;
export type TemplatesListResponse = Template[];
