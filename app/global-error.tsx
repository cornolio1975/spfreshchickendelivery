'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global Error caught:', error)

        // ChunkLoadError: Auto-reload to fetch new chunks
        if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
            // Prevent infinite reload loops
            const lastReload = sessionStorage.getItem('chunk_reload_time')
            const now = Date.now()

            if (!lastReload || now - parseInt(lastReload) > 10000) {
                console.log('ChunkLoadError detected, reloading page...')
                sessionStorage.setItem('chunk_reload_time', String(now))
                window.location.reload()
            }
        }
    }, [error])

    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong!</h2>
                        <p className="text-slate-500 mb-8">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all w-full"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    )
}
