import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("--- Lalamove Env Audit ---");
console.log("BASE_URL:", process.env.LALAMOVE_BASE_URL || "NOT SET (Defaulting to Production)");
console.log("MARKET:", process.env.LALAMOVE_MARKET || "NOT SET (Defaulting to MY_KUL)");
console.log("API_KEY Exists:", !!process.env.LALAMOVE_API_KEY);
console.log("API_SECRET Exists:", !!process.env.LALAMOVE_API_SECRET);
console.log("--------------------------");
