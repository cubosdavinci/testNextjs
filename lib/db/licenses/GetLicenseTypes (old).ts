import { supabaseAdmin} from '@/lib/supabase/clients/supabaseAdmin';
import { consoleLog } from '@/lib/utils';
import type { LicenseType } from '@/types/db/licenses';

/**
 * Fetches license types from the `next_auth.license_types` table.
 *
 * @param clientId - The UUID of the client. If `null`, returns global license types.
 * @returns A promise resolving to an array of LicenseType objects.
 */
export async function GetLicenseTypes(clientId: string | null): Promise<LicenseType[]> {
  try {
    let query = supabaseAdmin.from('license_types').select('*');

    if (clientId || clientId !== null) {
      query = query.eq('client_id', clientId);
    } else {
      query = query.is('client_id', null);
    }

    consoleLog("Query: ", [query])

    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      consoleLog('GetLicenseTypes Error:', [error.message]);
      throw new Error(error.message);
    }

    consoleLog(`Fetched ${data?.length || 0} license types`);
    return data || [];
  } catch (err: any) {
    consoleLog('GetLicenseTypes Exception:', err.message);
    throw err;
  }
}
