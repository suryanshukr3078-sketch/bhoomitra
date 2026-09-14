import { z } from 'zod';

export const contributeSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(300, { message: 'Title cannot exceed 300 characters' }),
  resourceType: z.enum(
    [
      'research_paper',
      'policy',
      'spatial_layer',
      'dataset',
      'report',
      'legal_document',
    ],
    { required_error: 'Please select a resource type' }
  ),
  abstract: z
    .string()
    .min(1, { message: 'Abstract / Summary is required' })
    .min(20, { message: 'Abstract must be at least 20 characters' }),
  publisher: z
    .string()
    .max(300, { message: 'Publisher cannot exceed 300 characters' })
    .optional(),
  jurisdiction: z
    .string()
    .min(1, { message: 'Jurisdiction or Region is required' }),
  visibility: z.enum(['public', 'registered', 'restricted'], {
    required_error: 'Please select visibility tier',
  }),
});

export type ContributeFormData = z.infer<typeof contributeSchema>;
