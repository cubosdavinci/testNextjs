export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

export function checkProductFileSizeLimit(
    file: any,
    unitValue: number = 100,
    unit: FileSizeUnit = "KB"
) {
    const fileSize = file?.size ?? file?.file_size;

    if (typeof fileSize !== "number") {
        throw new Error(
            `Unable to determine size for file ${file?.file_name ?? "unknown"}`
        );
    }

    const multipliers: Record<FileSizeUnit, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
    };

    const limitBytes = unitValue * multipliers[unit];

    if (fileSize > limitBytes) {
        throw new Error(
            `File size limit exceeded for "${file?.file_name ?? "unknown"}": ` +
            `actual ${(fileSize / multipliers["MB"]).toFixed(2)}MB, ` +
            `limit ${(limitBytes / multipliers["MB"]).toFixed(2)}MB`
        );
    }
}