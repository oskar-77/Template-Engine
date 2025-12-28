import { z } from 'zod';
import { insertTemplateSchema, templates } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  templates: {
    list: {
      method: 'GET' as const,
      path: '/api/templates',
      responses: {
        200: z.array(z.custom<typeof templates.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/templates',
      input: insertTemplateSchema,
      responses: {
        201: z.custom<typeof templates.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/templates/:id',
      input: insertTemplateSchema.partial(),
      responses: {
        200: z.custom<typeof templates.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/templates/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type TemplateInput = z.infer<typeof api.templates.create.input>;
export type TemplateResponse = z.infer<typeof api.templates.create.responses[201]>;
export type TemplateUpdateInput = z.infer<typeof api.templates.update.input>;
