module.exports = {
    apps: [
        {
            name: 'sp-fresh-chicken-delivery',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
        },
    ],
}
