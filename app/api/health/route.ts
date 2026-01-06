import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'SP Fresh Chicken Delivery API is running',
            env: {
                lalamove_key_configured: !!process.env.LALAMOVE_API_KEY,
                lalamove_secret_configured: !!process.env.LALAMOVE_API_SECRET,
                lalamove_market: process.env.LALAMOVE_MARKET || 'default',
                lalamove_base_url: process.env.LALAMOVE_BASE_URL || 'default',
                next_public_api_url: process.env.NEXT_PUBLIC_API_URL || 'missing'
            }
        },
        { status: 200 }
    )
}
