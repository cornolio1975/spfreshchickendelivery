import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'SP Fresh Chicken Delivery API is running'
        },
        { status: 200 }
    )
}
