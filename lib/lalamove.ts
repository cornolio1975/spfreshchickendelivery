
import CryptoJS from 'crypto-js';

const API_KEY = (process.env.LALAMOVE_API_KEY || 'pk_prod_860845508f4f025c73096e60998b2285').trim();
const API_SECRET = (process.env.LALAMOVE_API_SECRET || 'sk_prod_apDeSy1ahaol433/zI+GUXPFttHI1DqezYoLmZLxzYKXP368pMTI94PFXg5J5yVBD').trim();
const BASE_URL = (process.env.LALAMOVE_BASE_URL || 'https://rest.lalamove.com').trim();
const MARKET = (process.env.LALAMOVE_MARKET || 'MY_KUL').trim();

// Default Pickup Location (Fallback if shop GPS is missing)
export const DEFAULT_SHOP_LOCATION = {
    lat: "3.1578",
    lng: "101.7118",
    address: "Kuala Lumpur City Centre"
};

export class LalamoveService {
    // Address suggestions helper
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
                const parts = address.split(',').slice(-2).join(', '); // Try just the last two parts (city/state)
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
            console.log('[Lalamove] Starting quotation for:', address);
            console.log('[Lalamove] Options:', JSON.stringify(options));

            // 1. Geocode the delivery address if lat/lng not provided
            let deliveryLat = options?.lat;
            let deliveryLng = options?.lng;

            if (!deliveryLat || !deliveryLng) {
                console.log('[Lalamove] Lat/Lng missing, geocoding address...');
                const coords = await this.geocode(address);
                deliveryLat = coords.lat;
                deliveryLng = coords.lng;
            }

            const pickupLat = pickup?.lat || DEFAULT_SHOP_LOCATION.lat;
            const pickupLng = pickup?.lng || DEFAULT_SHOP_LOCATION.lng;
            const pickupAddress = pickup?.address || DEFAULT_SHOP_LOCATION.address;

            // 2. Format Body
            const time = new Date().getTime().toString();
            const method = 'POST';
            const path = '/v3/quotations';

            const bodyObj = {
                data: {
                    scheduleAt: options?.scheduleAt, 
                    serviceType: 'MOTORCYCLE',
                    stops: [
                        {
                            coordinates: {
                                lat: pickupLat.toString(),
                                lng: pickupLng.toString()
                            },
                            address: pickupAddress
                        },
                        {
                            coordinates: {
                                lat: deliveryLat.toString(),
                                lng: deliveryLng.toString()
                            },
                            address: address
                        }
                    ],
                    item: {
                        quantity: "1",
                        weight: "LESS_THAN_5KG",
                        categories: ["FOOD_AND_BEVERAGE"],
                        handlingInstructions: ["KEEP_UPRIGHT"]
                    },
                    isRouteOptimized: false,
                    language: "en_MY"
                }
            };

            const body = JSON.stringify(bodyObj);
            const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${body}`;
            const signature = CryptoJS.HmacSHA256(rawSignature, API_SECRET).toString();

            const url = `${BASE_URL}${path}`;
            console.log(`[Lalamove] Executing Fetch to: ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(url, {
                method: method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `hmac ${API_KEY}:${time}:${signature}`,
                    'Accept': 'application/json',
                    'Market': MARKET
                },
                body: body
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                console.error('[Lalamove] HTTP Status:', response.status);
                console.error('[Lalamove] API Error Payload:', JSON.stringify(data, null, 2));
                // Extract error message from Lalamove response format
                const lalaError = data.message || (data.errors ? data.errors[0]?.message : JSON.stringify(data));
                throw new Error(`Lalamove API Error: ${lalaError}`);
            }

            console.log('[Lalamove] Success:', JSON.stringify(data, null, 2));
            return data;
        } catch (error: any) {
            console.error('[Lalamove] NETWORK OR CONNECTIVITY ERROR:', error.message);
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Lalamove API Server is unreachable (Connection Refused).');
            }
            throw error;
        }
    }
}
