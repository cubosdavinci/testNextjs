const VERSION_REGEX = /^\d+(\.\d+){0,2}$/;

export const isVersion = (val: string): boolean => {
    return VERSION_REGEX.test(val);
};