// app/api/auth/google/get-linked-accounts/route.ts

import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { GoogleAuthService } from '@/lib/services/google/GoogleAuthService'; // Adjust the import path as needed
import { NextRequest, NextResponse } from 'next/server';
import { consoleLog } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        // Verify user session
        const supabase = await supabaseServer();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid session found' },
                { status: 401 }
            );
        }

        // Get user_id from query
        const userId = request.nextUrl.searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id query parameter is required' },
                { status: 400 }
            );
        }

        // Security check: prevent accessing other users' data
        if (userId !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden - You can only view your own linked accounts' },
                { status: 403 }
            );
        }

        // Call the service
        const googleAuthService = new GoogleAuthService();
        const linkedAccounts = await googleAuthService.getLinkedAccounts(userId);

        // Success response - always wrap in { data: { google_linked_accounts: ... } }
        return NextResponse.json({
            data: {
                google_linked_accounts: linkedAccounts ?? null,   // null or array
            },
        });

    } catch (err) {
        const errorMessage = err instanceof Error
            ? err.message
            : 'An unexpected error occurred while fetching linked Google accounts';

        consoleLog('Error in /api/auth/google/get-linked-accounts:', errorMessage);

        // Error response - exactly as frontend expects
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}