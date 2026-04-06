import { supabaseAdmin } from '@/lib/supabase/clients/supabaseAdmin';
import { consoleLog } from '@/lib/utils';
import type { LicenseTypeTerm } from '@/types/db/licenses';

/**
 * Fetches license terms from the `next_auth.license_type_terms` table
 * for a given license type.
 *
 * @param licenseTypeId - The ID of the license type (bigint)
 * @returns A promise resolving to an array of LicenseTypeTerm objects.
 */
export async function GetLicenseTerms(licenseTypeId: number): Promise<LicenseTypeTerm[]> {
  try {
    if (!licenseTypeId) {
      throw new Error('licenseTypeId is required');
    }

    const { data, error } = await supabaseAdmin
      .from('license_type_terms')
      .select('*')
      .eq('license_type_id', licenseTypeId)
      .order('cat_name', { ascending: true })
      .order('term_name', { ascending: true });

    if (error) {
      consoleLog('GetLicenseTerms Error:', [error.message]);
      throw new Error(error.message);
    }

    consoleLog(`Fetched ${data?.length || 0} terms for license_type_id=${licenseTypeId}`);
    return data || [];
  } catch (err: any) {
    consoleLog('GetLicenseTerms Exception:', err.message);
    throw err;
  }
}
