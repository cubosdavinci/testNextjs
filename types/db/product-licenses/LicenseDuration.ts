// types/db/product-licenses/LicenseDuration.ts
import type { Database } from "@/types/supabase";

export type LicenseDuration = Database["public"]["Enums"]["license_duration"];

export const LICENSE_DURATION_META: Record<
    LicenseDuration,
    { label: string; order: number }
> = {
    Forever: { label: "Forever", order: 0 },
    "1 Year": { label: "1 Year", order: 1 },
    "2 Years": { label: "2 Years", order: 2 },
    "3 Years": { label: "3 Years", order: 3 },
    "4 Years": { label: "4 Years", order: 4 },
    "5 Years": { label: "5 Years", order: 5 },
};

export const LICENSE_DURATION_OPTIONS = Object.entries(
    LICENSE_DURATION_META
)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([value, meta]) => ({
        value: value as LicenseDuration,
        label: meta.label,
    }));
    