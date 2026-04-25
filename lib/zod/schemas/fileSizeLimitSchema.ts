import { z } from "zod";

type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

const multipliers: Record<FileSizeUnit, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
};

export function fileSizeLimitSchema(
    limitValue: number,
    unit: FileSizeUnit = "B"
) {
    const limitBytes = limitValue * multipliers[unit];

    return z.number().refine((size) => size <= limitBytes, {
        message: `File size exceeds limit of ${limitValue}${unit}`,
    });
}