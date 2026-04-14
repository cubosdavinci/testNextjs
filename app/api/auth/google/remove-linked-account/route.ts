import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { GoogleAuthService } from '@/lib/services/google/GoogleAuthService';
import { NextRequest, NextResponse } from 'next/server';
import { consoleLog } from '@/lib/utils';

export async function DELETE(request: NextRequest) {
    try {
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

        const accountId = request.nextUrl.searchParams.get('id');

        if (!accountId) {
            return NextResponse.json(
                { error: 'id query parameter is required' },
                { status: 400 }
            );
        }

        const googleAuthService = new GoogleAuthService();

        // 🔥 now returns deleted row
        const deletedAccount = await googleAuthService.removeAccount(
            accountId,
            user.id
        );

        return NextResponse.json({
            data: {
                deleted_account: deletedAccount,
            },
        });

    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error
                ? err.message
                : 'An unexpected error occurred';

        consoleLog('Error in /api/auth/google/remove-account:', errorMessage);

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}