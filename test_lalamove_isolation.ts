import { LalamoveService } from './lib/lalamove';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    console.log("Testing Lalamove API...");
    console.log("API Key loaded?", !!process.env.LALAMOVE_API_KEY);
    console.log("API Secret loaded?", !!process.env.LALAMOVE_API_SECRET);
    console.log("Market:", process.env.LALAMOVE_MARKET);

    try {
        // Use a simple known address or the user's provided address
        const destination = "KLCC, Kuala Lumpur";
        console.log(`Getting quote for ${destination}...`);

        const quote = await LalamoveService.getQuotation(destination);
        console.log("Success! Quote:", JSON.stringify(quote, null, 2));
    } catch (error: any) {
        console.error("Test Failed!");
        console.error("Error Message:", error.message);
        // If it's the JSON string we threw
        try {
            const body = JSON.parse(error.message);
            console.error("Parsed Error Body:", body);
        } catch (e) {
            // raw message
        }
    }
}

test();
