
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.LALAMOVE_API_KEY;
const API_SECRET = process.env.LALAMOVE_API_SECRET;
const BASE_URL = process.env.LALAMOVE_BASE_URL || 'https://rest.lalamove.com';
const MARKET = process.env.LALAMOVE_MARKET || 'MY_KUL';

async function testQuotation() {
    console.log("Testing Lalamove JS Standalone...");
    console.log("Key:", API_KEY?.substring(0, 10) + "...");

    const time = new Date().getTime().toString();
    const method = 'POST';
    const path = '/v3/quotations';

    const bodyObj = {
        data: {
            serviceType: 'MOTORCYCLE',
            language: 'en_MY',
            stops: [
                {
                    coordinates: {
                        lat: "3.0182",
                        lng: "101.4592"
                    },
                    address: "Klang Shop"
                },
                {
                    coordinates: {
                        lat: "3.1390",
                        lng: "101.6869"
                    },
                    address: "Kuala Lumpur"
                }
            ]
        }
    };

    const body = JSON.stringify(bodyObj);
    const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${body}`;
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
            body: body
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response Payload:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

testQuotation();
