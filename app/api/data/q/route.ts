import { NextResponse } from 'next/server';
import { LalamoveService } from '@/lib/lalamove';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        console.log('[API Route] Starting delivery quote request...');

        const body = await request.json();
        console.log('[API Route] Received body:', JSON.stringify(body, null, 2));
        const { address, shopId, lat, lng, scheduleAt } = body;

        if (!address) {
            return NextResponse.json(
                { message: 'Delivery address is required' },
                { status: 400 }
            );
        }

        let pickupLocation = undefined;

        if (shopId) {
            // Fetch shop details
            console.log(`[API Route] Fetching shop details for ID: ${shopId}`);
            const { data: shop, error } = await supabase
                .from('shops')
                .select('*')
                .eq('id', shopId)
                .single();

            if (error) {
                console.error('[API Route] Error fetching shop:', error);
                console.warn('[API Route] Using default shop location due to fetch error.');
            } else if (shop) {
                pickupLocation = {
                    lat: shop.lat,
                    lng: shop.lng,
                    address: shop.address
                };
                console.log('[API Route] Using shop location:', pickupLocation);
            }
        }

        console.log('[API Route] Calling LalamoveService.getQuotation...');
        const quotation = await LalamoveService.getQuotation(address, pickupLocation, { lat, lng, scheduleAt });

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
