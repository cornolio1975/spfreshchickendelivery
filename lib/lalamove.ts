import CryptoJS from 'crypto-js';

const API_KEY = process.env.LALAMOVE_API_KEY || '';
const API_SECRET = process.env.LALAMOVE_API_SECRET || '';
const BASE_URL = 'https://rest.sandbox.lalamove.com';
const MARKET = 'MY_KUL';

// Temporary Pickup Location for Sandbox Testing (KLCC - covered by sandbox)
// TODO: Change back to actual shop location when using production keys
const SHOP_LOCATION = {
    lat: "3.1578",
    lng: "101.7118",
    address: "KLCC, Kuala Lumpur City Centre, 50088 Kuala Lumpur"
};

export class LalamoveService {
    // Geocoding helper
    static async geocode(address: string): Promise<{ lat: string, lng: string }> {
        const search = async (q: string) => {
            console.log(`[Geocode] Searching for: ${q}`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=my&limit=1`, {
                headers: { 'User-Agent': 'SP-Fresh-Chicken-Delivery/1.0' }
            });
            if (!res.ok) throw new Error(`Nominatim Error: ${res.status}`);
            return await res.json();
        };

        try {
            let data = await search(address);
            if (data && data.length > 0) return { lat: data[0].lat, lng: data[0].lon };

            const parts = address.split(',').map(p => p.trim());
            if (parts.length > 2) {
                const lessSpecific = parts.slice(1).join(', ');
                console.log(`[Geocode] Fallback 1: ${lessSpecific}`);
                data = await search(lessSpecific);
                if (data && data.length > 0) return { lat: data[0].lat, lng: data[0].lon };
            }

            if (parts.length >= 2) {
                const generalArea = parts.slice(-2).join(', ');
                console.log(`[Geocode] Fallback 2: ${generalArea}`);
                data = await search(generalArea);
                if (data && data.length > 0) return { lat: data[0].lat, lng: data[0].lon };
            }

            throw new Error(`Address not found: ${address}`);
        } catch (error) {
            console.error('[Geocode] Error:', error);
            throw new Error('Failed to geocode address. Please try a simpler address.');
        }
    }

    static async getQuotation(deliveryAddress: string) {
        try {
            console.log('[Lalamove] Getting quotation for:', deliveryAddress);

            // 1. Geocode Destination
            const destination = await this.geocode(deliveryAddress);
            console.log('[Lalamove] Destination coordinates:', destination);

            // 2. Prepare request following the sample code pattern
            const time = new Date().getTime().toString();
            const method = 'POST';
            const path = '/v3/quotations';

            // Ensure coordinates are strings as per Lalamove API spec
            const body = JSON.stringify({
                data: {
                    serviceType: 'MOTORCYCLE',
                    language: 'en_MY',
                    stops: [
                        {
                            coordinates: {
                                lat: String(SHOP_LOCATION.lat),
                                lng: String(SHOP_LOCATION.lng)
                            },
                            address: SHOP_LOCATION.address
                        },
                        {
                            coordinates: {
                                lat: String(destination.lat),
                                lng: String(destination.lng)
                            },
                            address: deliveryAddress
                        }
                    ]
                }
            });

            console.log('[Lalamove] Request body:', body);

            // 3. Generate signature exactly like the sample code
            const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${body}`;
            const signature = CryptoJS.HmacSHA256(rawSignature, API_SECRET).toString();

            console.log('[Lalamove] Request URL:', `${BASE_URL}${path}`);
            console.log('[Lalamove] Payload:', body);

            // 4. Make request with correct headers
            const response = await fetch(`${BASE_URL}${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `hmac ${API_KEY}:${time}:${signature}`,
                    'Accept': 'application/json',
                    'Market': MARKET
                },
                body: body
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[Lalamove] Status:', response.status);
                console.error('[Lalamove] Error:', JSON.stringify(data, null, 2));
                throw new Error(data.message || JSON.stringify(data));
            }

            console.log('[Lalamove] Success:', JSON.stringify(data, null, 2));
            return data;
        } catch (error: any) {
            console.error('[Lalamove] Error:', error);
            throw error;
        }
    }
}
