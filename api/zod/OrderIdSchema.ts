import { z } from 'zod';

// Regex pattern for UUID v4
const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

// Zod schema that validates a UUID v4 string
export const OrderIdSchema = z.string().regex(uuidV4Regex, {message: "Invalid order-id format (uuid)"})





