

import type { Database } from "@/types/supabase";

export type DbLicenseDuration = Database["public"]["Enums"]["license_duration"];

export const LICENSE_DURATION = {
    FOREVER: "Forever",
    ONE_YEAR: "1 Year",
    TWO_YEARS: "2 Years",
    THREE_YEARS: "3 Years",
    FOUR_YEARS: "4 Years",
    FIVE_YEARS: "5 Years",
} as const satisfies Record<string, DbLicenseDuration>;

export type LicenseDuration =
    typeof LICENSE_DURATION[keyof typeof LICENSE_DURATION];