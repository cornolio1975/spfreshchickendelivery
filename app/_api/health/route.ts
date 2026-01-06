import { NextResponse } from 'next/server';

export async function GET() {
    const envStatus = {
        LALAMOVE_API_KEY: !!process.env.LALAMOVE_API_KEY,
        LALAMOVE_API_SECRET: !!process.env.LALAMOVE_API_SECRET,
        LALAMOVE_MARKET: !!process.env.LALAMOVE_MARKET,
        LALAMOVE_BASE_URL: !!process.env.LALAMOVE_BASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    let lalamoveConnectivity = 'unknown';
    try {
        const start = Date.now();
        // Test GET first
        const resGet = await fetch('https://rest.lalamove.com', { method: 'GET', signal: AbortSignal.timeout(5000) });

        // Test POST (expect 401)
        const resPost = await fetch('https://rest.lalamove.com/v3/quotations', {
            method: 'POST',
            body: JSON.stringify({ test: true }),
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });

        const duration = Date.now() - start;
        lalamoveConnectivity = `GET:${resGet.status} POST:${resPost.status} - ${duration}ms`;
    } catch (e: any) {
        lalamoveConnectivity = `failed: ${e.message}`;
    }

    let nominatimConnectivity = 'unknown';
    try {
        const start = Date.now();
        // Use a simple query for Kuala Lumpur
        const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Kuala+Lumpur&limit=1', {
            method: 'GET',
            headers: { 'User-Agent': 'SP-Fresh-Chicken-Delivery/1.0' },
            signal: AbortSignal.timeout(5000)
        });
        const duration = Date.now() - start;
        nominatimConnectivity = `ok (${res.status}) - ${duration}ms`;
    } catch (e: any) {
        nominatimConnectivity = `failed: ${e.message}`;
    }

    return NextResponse.json({
        status: 'ok',
        env: envStatus,
        connectivity: {
            lalamove: lalamoveConnectivity,
            nominatim: nominatimConnectivity
        },
        timestamp: new Date().toISOString()
    });
}
