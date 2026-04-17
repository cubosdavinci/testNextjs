import { supabaseAdmin } from '@/lib/supabase/clients/supabaseAdmin';
import { consoleLog } from '@/lib/utils';
import type { LicenseType } from '@/types/db/licenses';

/**
 * Fetches license types from the `next_auth.license_types` table.
 *
 * @param creatorId - The UUID of the client. If `null`, returns only global license types.
 * @returns A promise resolving to an array of LicenseType objects.
 */
export async function GetLicenseTypes(creatorId: string | null | undefined): Promise<LicenseType[]> {
  try {
    const supabase = supabaseAdmin();
    let query = supabase.from('license_types').select('*');

    if (creatorId) {
      // Include both client-specific and global (null) licenses
      query = query.or(`creator_id.eq.${creatorId},creator_id.is.null`);
    } else {
      // Only global licenses
      query = query.is('client_id', null);
    }

    consoleLog("Query: ", [query]);

    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      consoleLog('GetLicenseTypes Error:', [error.message]);
      throw new Error(error.message);
    }

    consoleLog(`Fetched ${data?.length || 0} license types`);
    return data || [];
  } catch (err) {
    if (err instanceof Error) {
      consoleLog('GetLicenseTypes Exception:', err.message);
    }
    throw err;
  }
}
