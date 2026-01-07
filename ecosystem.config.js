module.exports = {
    apps: [
        {
            name: 'sp-fresh-chicken-delivery',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                LALAMOVE_API_KEY: 'pk_prod_860845508f4f025c73096e60998b2285',
                LALAMOVE_API_SECRET: 'sk_prod_apDeSy1ahaol433/zI+GUXPFttHI1DqezYoLmZLxzYKXP368pMTI94PFXg5J5yVB',
                LALAMOVE_MARKET: 'MY',
                LALAMOVE_BASE_URL: 'https://rest.lalamove.com',
                NEXT_PUBLIC_API_URL: 'https://spfreshchickendelivery.com'
            },
        },
    ],
}
