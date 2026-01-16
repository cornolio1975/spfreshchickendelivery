'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('App Error caught:', error)

        // ChunkLoadError: Auto-reload to fetch new chunks
        if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
            window.location.reload()
        }
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
                <p className="text-slate-500 mb-6 text-sm">
                    {error.message || "An unexpected error occurred."}
                </p>
                <div className="flex gap-4">
                    <Button
                        onClick={() => reset()}
                        variant="outline"
                        className="flex-1"
                    >
                        Try Again
                    </Button>
                    <Button
                        onClick={() => window.location.reload()}
                        className="flex-1"
                    >
                        Reload Page
                    </Button>
                </div>
            </div>
        </div>
    )
}
