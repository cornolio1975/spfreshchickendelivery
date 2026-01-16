'use client'

import { useEffect } from 'react'

export function GlobalErrorHandler() {
    useEffect(() => {
        const handler = (event: ErrorEvent | PromiseRejectionEvent) => {
            // Retrieve the error object
            const error = event instanceof ErrorEvent ? event.error : event.reason

            // Sometimes error might be null/undefined for check
            if (!error) return

            const message = error.message || String(error)

            // Check for chunk loading errors
            if (
                message.includes('ChunkLoadError') ||
                message.includes('Loading chunk') ||
                message.includes('minified React error')
            ) {
                console.warn('Global ChunkLoadError detected:', message)

                // Prevent infinite reload loops (10 second cooldown)
                const lastReload = sessionStorage.getItem('chunk_reload_time')
                const now = Date.now()

                if (!lastReload || now - parseInt(lastReload) > 10000) {
                    console.log('Reloading page to recover from chunk error...')
                    sessionStorage.setItem('chunk_reload_time', String(now))
                    window.location.reload()
                }
            }
        }

        // Add listeners for both uncaught errors and unhandled promise rejections
        window.addEventListener('error', handler)
        window.addEventListener('unhandledrejection', handler)

        return () => {
            window.removeEventListener('error', handler)
            window.removeEventListener('unhandledrejection', handler)
        }
    }, [])

    return null
}
