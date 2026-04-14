import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { GoogleAuthService } from '@/lib/services/google/GoogleAuthService';
import { consoleLog } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await supabaseServer();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid session found' },
                { status: 401 }
            );
        }

        // 2. Read from query param
        const id = request.nextUrl.searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'id is required' },
                { status: 400 }
            );
        }

        // 3. Service call
        const googleAuthService = new GoogleAuthService();

        await googleAuthService.disconnectAccount(user.id, id);

        // 🔥 4. IMPORTANT FIX: return FULL updated list
        const updatedAccounts = await googleAuthService.getLinkedAccounts(user.id);

        return NextResponse.json({
            data: {
                google_linked_accounts: updatedAccounts ?? [],
            },
        });

    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error
                ? err.message
                : 'An unexpected error occurred while disconnecting Google account';

        consoleLog(
            'Error in /api/auth/google/disconnect-linked-account:',
            errorMessage
        );

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}