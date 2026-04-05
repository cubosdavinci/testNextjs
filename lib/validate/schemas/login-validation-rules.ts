import { z } from 'zod';


// Shared validation schema for username, email, and password
export const getValidationRules = () => ({
  /*username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),*/
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    captchaToken: z.string().optional(),
    mode: z.enum(["login", "register"]), // only these two allowed
});


// Schema for the entire form
export const loginFormSchema = z.object(getValidationRules());


// Type for the form data
export type FormData = z.infer<typeof loginFormSchema>;