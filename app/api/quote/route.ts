import { NextResponse } from 'next/server';
import { LalamoveClient } from '@/lib/lalamove';

export async function POST(request: Request) {
    console.log("API Key present:", !!process.env.LALAMOVE_API_KEY);
    console.log("API Secret present:", !!process.env.LALAMOVE_API_SECRET);
    try {
        const body = await request.json();
        const { address } = body;

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const quote = await LalamoveClient.getQuote(address);
        return NextResponse.json(quote);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to get quote' },
            { status: 500 }
        );
    }
}
