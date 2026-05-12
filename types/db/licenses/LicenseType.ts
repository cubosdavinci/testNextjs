// types/db/licenses/LicenseType.ts
import type { Database } from "@/types/supabase";

// 1. Get the base row type from your Supabase schema
export type LicenseTypeRow = Database["public"]["Tables"]["license_types"]["Row"];

// 2. Define the Metadata structure
export interface LicenseTypeMeta {
  label: string;
  description: string;
  icon: string;
  ui_order: number;
}

// 3. Centralized Registry (Mapped by the 'name' column)
export const LICENSE_TYPE_META: Record<string, LicenseTypeMeta> = {
  "Personal": {
    label: "Personal",
    description: "For non-commercial use only, such as private projects, study, or personal enjoyment.",
    icon: "/icons/license-type/streamline-ultimate-color:gift-box-1.svg",
    ui_order: 1,
  },
  "Royalty-Free": {
    label: "Royalty-Free",
    description: "One-time purchase license that allows repeated use without paying royalties.",
    icon: "/icons/license-type/streamline-ultimate-color:trends-torch.svg",
    ui_order: 2,
  },
  "Commercial": {
    label: "Commercial",
    description: "Allows use in business or monetized projects.",
    icon: "/icons/license-type/streamline-ultimate-color:rating-star-ribbon.svg",
    ui_order: 3,
  },
  "Extended Commercial": {
    label: "Extended Commercial",
    description: "Broader commercial rights covering higher distribution or larger audiences.",
    icon: "/icons/license-type/streamline-ultimate-color:ranking-stars-ribbon.svg",
    ui_order: 4,
  },
  "Limited Use": {
    label: "Limited Use",
    description: "Restricted usage with specific constraints (time, scope, or platform).",
    icon: "/icons/license-type/streamline-ultimate-color:certified-diploma.svg",
    ui_order: 5,
  },
  "Educational": {
    label: "Educational",
    description: "For teaching, training, academic research, and classroom materials.",
    icon: "/icons/license-type/streamline-ultimate-color:love-it-flag.svg",
    ui_order: 6,
  },
  "Editorial": {
    label: "Editorial",
    description: "For informational or news-related use only. No advertising allowed.",
    icon: "/icons/license-type/streamline-ultimate-color:rating-star-winner.svg",
    ui_order: 7,
  },
  "Exclusive": {
    label: "Exclusive",
    description: "Grants exclusive usage rights; asset cannot be licensed to others.",
    icon: "/icons/license-type/streamline-ultimate-color:award-medal-4.svg",
    ui_order: 8,
  },
};

// 4. Helper for generating UI options (Select dropdowns)
export const LICENSE_TYPE_OPTIONS = Object.entries(LICENSE_TYPE_META)
  .sort(([, a], [, b]) => a.ui_order - b.ui_order)
  .map(([key, meta]) => ({
    value: key,
    label: meta.label,
    icon: meta.icon,
    description: meta.description
  }));