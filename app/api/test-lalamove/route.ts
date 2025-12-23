import { NextResponse } from 'next/server';

export async function GET() {
    const API_KEY = process.env.LALAMOVE_API_KEY || '';
    const API_SECRET = process.env.LALAMOVE_API_SECRET || '';
    const BASE_URL = process.env.LALAMOVE_BASE_URL || '';
    const MARKET = process.env.LALAMOVE_MARKET || '';

    return NextResponse.json({
        status: 'Environment Check',
        hasApiKey: !!API_KEY,
        apiKeyPrefix: API_KEY.substring(0, 10),
        hasApiSecret: !!API_SECRET,
        secretPrefix: API_SECRET.substring(0, 10),
        baseUrl: BASE_URL,
        market: MARKET
    });
}
