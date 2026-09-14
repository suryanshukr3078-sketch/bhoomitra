import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' })
      .min(2, { message: 'Name must be at least 2 characters' }),
    email: z
      .string()
      .min(1, { message: 'Email address is required' })
      .email({ message: 'Please enter a valid email address' }),
    organizationCategory: z.enum(
      ['academic', 'policy_maker', 'government', 'civil_society'],
      {
        errorMap: () => ({ message: 'Please select an organization category' }),
      }
    ),
    organizationName: z
      .string()
      .min(1, { message: 'Organization name is required' })
      .min(2, { message: 'Organization name must be at least 2 characters' }),
    organization: z.string().optional(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must agree to the data governance terms of service',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
