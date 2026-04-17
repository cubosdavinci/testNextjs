/**
 * Represents a row from the `next_auth.license_terms` table.

export interface LicenseTerm {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  created_at: string | null; // ISO timestamp (with time zone)
  updated_at: string | null; // ISO timestamp (with time zone)
  //allowed: boolean | null; // from license_type_terms.allowed
} */


/**
 * Represents a row from the `next_auth.license_terms_category` table.

export interface LicenseTermCategory {
  id: number;
  name: string;
  description: string | null;
  terms: LicenseTerm[];
} */

export interface LicenseTypeTerm {
  license_type_id: number; // bigint
  term_id: number; // smallint
  term_name: string | null; // text
  cat_name: string | null; // text
  allowed: boolean | null; // defaults to true
  created_at: string | null; // ISO timestamp with time zone
  updated_at: string | null; // ISO timestamp with time zone
}


/**
 * Represents a row from the `next_auth.license_types` table.
 */
export interface LicenseType {
  id: string; // bigint
  creator_id: string | null; // uuid
  name: string;
  description: string | null;
  created_at: string | null; // ISO timestamp (with time zone)
  updated_at: string | null; // ISO timestamp (with time zone)
}




/**
 * Example

const exampleLicense: License = {
  id: 1,
  typeId: 10,
  type: {
    id: 10,
    client_id: null,
    name: 'Pro License',
    description: 'Full access to all premium features.',
    created_at: '2024-05-01T12:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  userId: 'uuid-here',
  issuedAt: '2024-06-10T08:00:00Z',
  expiresAt: null,
  isActive: true,
}; */