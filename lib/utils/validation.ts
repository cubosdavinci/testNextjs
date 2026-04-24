const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Matches one or more digits, a dot, one or more digits, a dot, and one or more digits.
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Validates if a string is a valid UUID and not the NIL UUID (all zeros).
 */
export const isUUID = (val: string): boolean => {
    return UUID_REGEX.test(val) && val !== NIL_UUID;
};

/**
 * Validates if a string follows the version format (e.g., "0.0.0" or "1.23.45").
 */
export const isVersion = (val: string): boolean => {
    return VERSION_REGEX.test(val);
};