
import CryptoJS from 'crypto-js';

// --- CONFIGURATION ---
const API_KEY = 'pk_prod_860845508f4f025c73096e60998b2285';
// NOTE: User provided secret ends in 'VB', previous attempts used 'VBD'. Using the new one.
const API_SECRET = 'sk_prod_apDeSy1ahaol433/zI+GUXPFttHI1DqezYoLmZLxzYKXP368pMTI94PFXg5J5yVB';
const BASE_URL = 'https://rest.lalamove.com'; // Production
const MARKET = 'MY'; // Malaysia Market Code

// --- TYPES ---
interface Coordinates {
    lat: string;
    lng: string;
}

interface DeliveryStop {
    coordinates: Coordinates;
    address: string;
}

interface QuotationRequest {
    data: {
        scheduleAt?: string; // UTC ISO String: "2020-09-01T14:30:00.00Z"
        serviceType: string; // "MOTORCYCLE"
        specialRequests?: string[];
        language: string; // "en_MY"
        stops: DeliveryStop[];
        item: {
            quantity: string;
            weight: string;
            categories: string[];
            handlingInstructions: string[];
        };
        isRouteOptimized: boolean;
    }
}

export const DEFAULT_SHOP_LOCATION = {
    lat: "3.1578",
    lng: "101.7118",
    address: "Kuala Lumpur City Centre"
};

export class LalamoveService {

    // --- HELPER: Address Suggestions (Nominatim) ---
    static async suggestAddresses(query: string) {
        console.log(`[Suggest] Searching: ${query}`);
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

    // --- HELPER: Geocoding (Nominatim) ---
    static async geocode(address: string): Promise<Coordinates> {
        const search = async (q: string) => {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=my&limit=1`, {
                headers: { 'User-Agent': 'SP-Fresh-Chicken-Delivery/1.0' }
            });
            if (!res.ok) throw new Error(`Nominatim Error: ${res.status}`);
            const results = await res.json();
            return results;
        };

        const cleanQuery = (q: string) => q.replace(/[#]/g, '').trim();

        try {
            let results = await search(cleanQuery(address));
            if (results.length === 0) {
                const parts = address.split(',').slice(-2).join(', ');
                results = await search(cleanQuery(parts)); // Retry with city/state
            }

            if (results.length > 0) {
                return { lat: results[0].lat, lng: results[0].lon };
            }
            throw new Error(`Address geocoding failed for: ${address}`);
        } catch (error: any) {
            console.error('[Geocode] Error:', error.message);
            throw new Error(`Geocoding Failed: ${error.message}`);
        }
    }

    // --- MAIN: Get Quotation ---
    static async getQuotation(deliveryAddress: string, pickup?: { lat: string, lng: string, address: string }, options?: { lat?: string, lng?: string, scheduleAt?: string }) {
        try {
            console.log('[Lalamove] --- START QUOTATION ---');
            console.log(`[Lalamove] Delivery To: ${deliveryAddress}`);

            // 1. Resolve Delivery Coordinates
            let deliveryLat = options?.lat;
            let deliveryLng = options?.lng;

            if (!deliveryLat || !deliveryLng) {
                console.log('[Lalamove] Geocoding delivery address...');
                const coords = await this.geocode(deliveryAddress);
                deliveryLat = coords.lat;
                deliveryLng = coords.lng;
            }

            // 2. Prepare Payload (Strictly following user sample logic)
            const pickupLat = pickup?.lat || DEFAULT_SHOP_LOCATION.lat;
            const pickupLng = pickup?.lng || DEFAULT_SHOP_LOCATION.lng;
            const pickupAddress = pickup?.address || DEFAULT_SHOP_LOCATION.address;

            const payload: QuotationRequest = {
                data: {
                    serviceType: "MOTORCYCLE",
                    language: "en_MY",
                    specialRequests: ["THERMAL_BAG_1"],
                    stops: [
                        {
                            coordinates: { lat: pickupLat.toString(), lng: pickupLng.toString() },
                            address: pickupAddress
                        },
                        {
                            coordinates: { lat: deliveryLat!.toString(), lng: deliveryLng!.toString() },
                            address: deliveryAddress
                        }
                    ],
                    item: {
                        quantity: "1",
                        weight: "LESS_THAN_10KG", // Adjusted for Chicken (standard bike limit usually)
                        categories: ["FOOD_DELIVERY"], // Using FOOD_DELIVERY as per sample (check if MY supports it, otherwise generic)
                        handlingInstructions: ["KEEP_UPRIGHT"]
                    },
                    isRouteOptimized: false
                }
            };

            // Add optional scheduleAt
            if (options?.scheduleAt) {
                payload.data.scheduleAt = options.scheduleAt; // Expected format: 2026-01-07T15:00:00.00Z
            }

            const bodyStr = JSON.stringify(payload);

            // 3. Generate Signature
            const time = new Date().getTime().toString();
            const method = 'POST';
            const path = '/v3/quotations';

            // Format: TIMESTAMP\r\nMETHOD\r\nPATH\r\n\r\nBODY
            const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${bodyStr}`;

            const signature = CryptoJS.HmacSHA256(rawSignature, API_SECRET).toString();

            // 4. Send Request
            const url = `${BASE_URL}${path}`;
            console.log(`[Lalamove] Request: ${method} ${url}`);
            console.log(`[Lalamove] Market: ${MARKET}`);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(url, {
                method: method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `hmac ${API_KEY}:${time}:${signature}`,
                    'Accept': 'application/json',
                    'Market': MARKET
                },
                body: bodyStr
            });
            clearTimeout(timeout);

            const responseData = await response.json();

            if (!response.ok) {
                console.error('[Lalamove] API FAIL:', response.status);
                console.error('[Lalamove] Error Data:', JSON.stringify(responseData, null, 2));

                // Parse error message
                let errorMsg = "Unknown Error";
                if (responseData.message) errorMsg = responseData.message;
                else if (responseData.errors && responseData.errors.length > 0) errorMsg = responseData.errors[0].message;

                throw new Error(`Lalamove: ${errorMsg}`);
            }

            console.log('[Lalamove] SUCCESS:', JSON.stringify(responseData, null, 2));
            return responseData;

        } catch (error: any) {
            console.error('[Lalamove] EXCEPTION:', error.message);
            throw error;
        }
    }
}
