
import * as Lalamove from '@lalamove/lalamove-js';

const API_KEY = (process.env.LALAMOVE_API_KEY || 'pk_prod_860845508f4f025c73096e60998b2285').trim();
const API_SECRET = (process.env.LALAMOVE_API_SECRET || 'sk_prod_apDeSy1ahaol433/zI+GUXPFttHI1DqezYoLmZLxzYKXP368pMTI94PFXg5J5yVBD').trim();
const BASE_URL = (process.env.LALAMOVE_BASE_URL || 'https://rest.lalamove.com').trim();
const MARKET = (process.env.LALAMOVE_MARKET || 'MY_KUL').trim();

// Initialize SDK
const sdkClient = new Lalamove.ClientModule(
    new Lalamove.Config(
        API_KEY,
        API_SECRET,
        MARKET as any // Type assertion needed as string comes from env
    )
);

// Fallback Shop Location
export const DEFAULT_SHOP_LOCATION = {
    lat: "3.1578",
    lng: "101.7118",
    address: "Kuala Lumpur City Centre"
};

export class LalamoveService {
    // Address suggestions helper (kept same as before, uses OSM)
    static async suggestAddresses(query: string) {
        console.log(`[Suggest] Searching for: ${query}`);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=my&limit=5&addressdetails=1`, {
                headers: { 'User-Agent': 'SP-Fresh-Chicken-Delivery/1.0' }
            });

            if (!res.ok) throw new Error(`Nominatim Error: ${res.status}`);
            const results = await res.json();

            return results.map((item: any) => ({
                address: item.display_name,
                lat: item.lat,
                lng: item.lon
            }));
        } catch (error: any) {
            console.error('[Suggest] Error:', error.message);
            throw error;
        }
    }

    // Geocoding helper
    static async geocode(address: string): Promise<{ lat: string, lng: string }> {
        const search = async (q: string) => {
            console.log(`[Geocode] Searching for: ${q}`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=my&limit=1`, {
                headers: { 'User-Agent': 'SP-Fresh-Chicken-Delivery/1.0' }
            });
            if (!res.ok) throw new Error(`Nominatim Error: ${res.status}`);
            const results = await res.json();
            return results;
        };

        const cleanQuery = (q: string) => q.replace(/[#]/g, '').trim();

        try {
            // First try: full address
            let results = await search(cleanQuery(address));

            // Second try: without leading symbols if it failed
            if (results.length === 0) {
                const parts = address.split(',').slice(-2).join(', ');
                results = await search(cleanQuery(parts));
            }

            if (results.length > 0) {
                return { lat: results[0].lat, lng: results[0].lon };
            }

            throw new Error(`Address geocoding failed for: ${address}`);
        } catch (error: any) {
            console.error('[Geocode] CRITICAL ERROR:', error.message);
            throw new Error(`Geocoding Failed: ${error.message}`);
        }
    }

    static async getQuotation(address: string, pickup?: { lat: string, lng: string, address: string }, options?: { lat?: string, lng?: string, scheduleAt?: string }) {
        try {
            console.log('[Lalamove SDK] Starting quotation for:', address);

            // 1. Geocode if needed
            let deliveryLat = options?.lat;
            let deliveryLng = options?.lng;

            if (!deliveryLat || !deliveryLng) {
                console.log('[Lalamove SDK] Geocoding address...');
                const coords = await this.geocode(address);
                deliveryLat = coords.lat;
                deliveryLng = coords.lng;
            }

            const pickupLat = pickup?.lat || DEFAULT_SHOP_LOCATION.lat;
            const pickupLng = pickup?.lng || DEFAULT_SHOP_LOCATION.lng;
            const pickupAddress = pickup?.address || DEFAULT_SHOP_LOCATION.address;

            // 2. Prepare SDK Payload
            const quotationPayload = Lalamove.QuotationPayloadBuilder.quotationPayload()
                .withServiceType('MOTORCYCLE')
                .withLanguage('en_MY')
                .withStops([
                    {
                        coordinates: { lat: pickupLat.toString(), lng: pickupLng.toString() },
                        address: pickupAddress
                    },
                    {
                        coordinates: { lat: deliveryLat.toString(), lng: deliveryLng.toString() },
                        address: address
                    }
                ])
                .withItem({
                    quantity: '1',
                    weight: 'LESS_THAN_5KG',
                    categories: ['FOOD_AND_BEVERAGE'],
                    handlingInstructions: ['KEEP_UPRIGHT']
                })
                .withIsRouteOptimized(false)
                .build();

            // Add scheduleAt if present
            if (options?.scheduleAt) {
                // SDK builder might not expose scheduleAt easily in fluent interface depending on version
                // We can inject it into the built object if needed, or use proper setter if available
                // Checking documentation for version 1.1.0... usually it's .withScheduleAt()
                (quotationPayload as any).data.scheduleAt = options.scheduleAt;
            }

            console.log('[Lalamove SDK] Sending Payload:', JSON.stringify(quotationPayload));

            const quotationCallback = await sdkClient.Quotation.create(MARKET as any, quotationPayload);

            console.log('[Lalamove SDK] Success:', JSON.stringify(quotationCallback));
            return quotationCallback;

        } catch (error: any) {
            console.error('[Lalamove SDK] Error:', error);
            // SDK errors usually have a nested structure
            const errorConfig = error.config || {};
            const errorResponse = error.response || {}; // The actual response from server if available

            console.error('[Lalamove SDK] Config:', JSON.stringify(errorConfig));
            console.error('[Lalamove SDK] Response:', JSON.stringify(errorResponse.data));

            throw new Error(JSON.stringify(errorResponse.data || error.message));
        }
    }
}
