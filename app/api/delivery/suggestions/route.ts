import { NextRequest, NextResponse } from 'next/server';
import { LalamoveService } from '@/lib/lalamove';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const suggestions = await LalamoveService.suggestAddresses(query);
        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error('[API Suggestions] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
