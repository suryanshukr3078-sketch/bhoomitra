import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: 'Full name is required' })
    .min(2, { message: 'Name must be at least 2 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  organization: z
    .string()
    .min(1, { message: 'Organization name is required' }),
  category: z.enum(
    [
      'registry_partnership',
      'surveyor_accreditation',
      'research_submission',
      'data_inquiry',
      'technical_support',
      'other',
    ],
    { required_error: 'Please select an inquiry category' }
  ),
  subject: z
    .string()
    .min(1, { message: 'Subject line is required' })
    .min(5, { message: 'Subject must be at least 5 characters' }),
  message: z
    .string()
    .min(1, { message: 'Message content is required' })
    .min(20, { message: 'Message must be at least 20 characters' })
    .max(2000, { message: 'Message cannot exceed 2000 characters' }),
});

export type ContactFormData = z.infer<typeof contactSchema>;
