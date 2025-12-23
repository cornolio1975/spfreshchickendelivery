import { NextResponse } from 'next/server';
import { LalamoveService } from '@/lib/lalamove';

export async function POST(request: Request) {
    try {
        console.log('[API Route] Starting quotation request...');

        const body = await request.json();
        const { address } = body;

        console.log('[API Route] Address received:', address);

        if (!address) {
            return NextResponse.json(
                { message: 'Delivery address is required' },
                { status: 400 }
            );
        }

        console.log('[API Route] Calling LalamoveService.getQuotation...');
        const quotation = await LalamoveService.getQuotation(address);

        console.log('[API Route] Quotation received successfully');
        return NextResponse.json(quotation);
    } catch (error: any) {
        console.error('[API Route] Full Error:', error);
        console.error('[API Route] Error Stack:', error.stack);
        console.error('[API Route] Error Message:', error.message);

        // Try to parse if it's a JSON error message
        let errorMessage = error.message || 'Failed to get delivery quote';
        let errorDetails = null;

        try {
            errorDetails = JSON.parse(error.message);
            errorMessage = errorDetails.message || errorMessage;
        } catch (e) {
            // Not JSON, use as-is
        }

        return NextResponse.json(
            {
                message: errorMessage,
                details: errorDetails,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
