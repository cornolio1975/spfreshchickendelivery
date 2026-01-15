const CryptoJS = require('crypto-js');
// Native fetch is available in Node 18+

// HARDCODED CREDENTIALS (MATCHING LIB/LALAMOVE.TS)
const API_KEY = 'pk_prod_860845508f4f025c73096e60998b2285';
const API_SECRET = 'sk_prod_apDeSy1ahaol433/zI+GUXPFttHI1DqezYoLmZLxzYKXP368pMTI94PFXg5J5yVB';
const BASE_URL = 'https://rest.lalamove.com';
const MARKET = 'MY';

async function testLalamoveQuote() {
    console.log('Testing Lalamove Connection...');

    const payload = {
        data: {
            serviceType: "MOTORCYCLE",
            language: "en_MY",
            specialRequests: ["THERMAL_BAG_1"],
            stops: [
                {
                    coordinates: { lat: "3.1578", lng: "101.7118" }, // KLCC
                    address: "Kuala Lumpur City Centre"
                },
                {
                    coordinates: { lat: "3.1390", lng: "101.6869" }, // KL Sentral
                    address: "KL Sentral"
                }
            ],
            item: {
                quantity: "1",
                weight: "LESS_THAN_10KG",
                categories: ["FOOD_DELIVERY"],
                handlingInstructions: ["KEEP_UPRIGHT"]
            },
            isRouteOptimized: false
        }
    };

    const bodyStr = JSON.stringify(payload);
    const time = new Date().getTime().toString();
    const method = 'POST';
    const path = '/v3/quotations';
    const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${bodyStr}`;
    const signature = CryptoJS.HmacSHA256(rawSignature, API_SECRET).toString();

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `hmac ${API_KEY}:${time}:${signature}`,
                'Accept': 'application/json',
                'Market': MARKET
            },
            body: bodyStr
        });

        const data = await response.json();
        console.log('Status:', response.status);
        if (response.ok) {
            console.log('SUCCESS: Quote received!');
            console.log('Price Breakdown:', data.data?.priceBreakdown?.total);
        } else {
            console.error('FAILED:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('EXCEPTION:', e);
    }
}

testLalamoveQuote();
