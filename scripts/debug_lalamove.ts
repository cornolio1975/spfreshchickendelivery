import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = (process.env.LALAMOVE_API_KEY || '').trim();
const API_SECRET = (process.env.LALAMOVE_API_SECRET || '').trim();
const BASE_URL = (process.env.LALAMOVE_BASE_URL || 'https://rest.lalamove.com').trim();
const MARKET = (process.env.LALAMOVE_MARKET || 'MY_KUL').trim();

// Inline LalamoveService logic for debugging
async function getQuotation(address: string) {
    console.log('API_KEY present:', !!API_KEY);
    console.log('API_SECRET present:', !!API_SECRET);
    console.log('BASE_URL:', BASE_URL);
    console.log('MARKET:', MARKET);

    const time = new Date().getTime().toString();
    const method = 'POST';
    const path = '/v3/quotations';

    const bodyObj = {
        data: {
            serviceType: 'MOTORCYCLE',
            stops: [
                {
                    coordinates: {
                        lat: "3.1578",
                        lng: "101.7118"
                    },
                    address: "Kuala Lumpur City Centre"
                },
                {
                    // Hardcoded destination for testing
                    coordinates: {
                        lat: "3.006627", // Example coordinates for the Bukit Rimau address
                        lng: "101.527663"
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
            isRouteOptimized: false
        }
    };

    const body = JSON.stringify(bodyObj);
    const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${body}`;
    const signature = CryptoJS.HmacSHA256(rawSignature, API_SECRET).toString();

    console.log('Request Payload:', JSON.stringify(bodyObj, null, 2));

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
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.data && data.data.priceBreakdown) {
        console.log('Price Breakdown:', JSON.stringify(data.data.priceBreakdown, null, 2));
    }
}

getQuotation("31, Jalan Sungai Kelubi 32/106a, Bukit Rimau, 40460 Shah Alam, Selangor, Malaysia");
