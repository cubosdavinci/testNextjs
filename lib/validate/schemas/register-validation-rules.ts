import { z } from 'zod';


// Shared validation schema for username, email, and password
export const getValidationRules = () => ({
    firstname: z
        .string()
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z]+$/, 'Username can only contain letters')
        .optional(),
    lasttname: z
        .string()
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z]+$/, 'Username can only contain letters')
        .optional(),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})


// Schema for the entire form
export const registerFormSchema = z.object(getValidationRules()).refine((data) => data.password === data.confirmPassword, {
         message: 'Passwords must match',
         path: ['confirmPassword'],
       })


// Type for the form data
export type FormData = z.infer<typeof registerFormSchema>;