import { z } from 'zod';

export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const resourceTypeSchema = z.enum([
  'research_paper',
  'policy',
  'spatial_layer',
  'dataset',
  'report',
  'legal_document',
  'model',
  'case_study',
]);

export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const policyStatusSchema = z.enum([
  'draft',
  'consultation',
  'active',
  'suspended',
  'superseded',
  'withdrawn',
]);

export type PolicyStatus = z.infer<typeof policyStatusSchema>;
