// app/api/auth/google/access-token/route.ts

import { supabaseServer } from '@/lib/supabase/clients/supabaseServer';
import { GoogleAuthService } from '@/lib/services/google/GoogleAuthService';
import { NextRequest, NextResponse } from 'next/server';
import { consoleLog } from '@/lib/utils';

export async function GET(request: NextRequest) {
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

        const accessToken = await googleAuthService.getValidAccessToken(accountId);

        return NextResponse.json({
            data: {
                access_token: accessToken,
            },
        });

    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error
                ? err.message
                : 'An unexpected error occurred';

        consoleLog(
            'Error in /api/auth/google/refresh-access-token:',
            errorMessage
        );

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}