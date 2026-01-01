import { LalamoveService } from "../lib/lalamove";
import dotenv from "dotenv";

// Load env vars from .env.local
dotenv.config({ path: ".env.local" });

async function test() {
    console.log("Testing Lalamove API...");
    console.log("Key:", process.env.LALAMOVE_API_KEY ? "Found" : "Missing");
    console.log("Secret:", process.env.LALAMOVE_API_SECRET ? "Found" : "Missing");

    try {
        const quote = await LalamoveService.getQuotation("31, Jalan Sungai Kelubi 32/106a, Bukit Rimau, 40460 Shah Alam, Selangor, Malaysia");
        console.log("Success! Quote:", quote);
    } catch (error: any) {
        console.error("Failed:", error.message);
        if (error.response) {
            console.error("Response:", await error.response.text());
        }
    }
}

test();
