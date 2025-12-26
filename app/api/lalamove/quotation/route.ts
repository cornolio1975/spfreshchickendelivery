import { NextResponse } from 'next/server';
import { LalamoveService } from '@/lib/lalamove';
import { supabase } from '@/lib/supabase'; // Ensure this client is available on server

export async function POST(request: Request) {
    try {
        console.log('[API Route] Starting quotation request...');

        const body = await request.json();
        const { address, shopId } = body;

        console.log('[API Route] Address received:', address);
        console.log('[API Route] Shop ID received:', shopId);

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
            // Note: We need to use valid Supabase client for server-side if not using public API
            // Assuming @/lib/supabase exports a client that works here (likely using Anon key)
            // For server-side secure access, we might need a service role client, but Anon key should work for reading public table 'shops'
            const { data: shop, error } = await supabase
                .from('shops')
                .select('*')
                .eq('id', shopId)
                .single();

            if (error) {
                console.error('[API Route] Error fetching shop:', error);
                // Fallback or error? Let's error for now if shop ID was explicit
                // return NextResponse.json({ message: 'Invalid shop selected' }, { status: 400 });
                // Actually, let's log and proceed with default to avoid complete breakage if DB issue
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
        const quotation = await LalamoveService.getQuotation(address, pickupLocation);

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
