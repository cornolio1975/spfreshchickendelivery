"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { CheckCircle2, MessageCircle, Home, ShoppingBag, Loader2 } from "lucide-react"
import { Suspense, useEffect, useState } from 'react'

function OrderConfirmationContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isRedirecting, setIsRedirecting] = useState(false)

    // Robust fallbacks for parameters
    const userId = searchParams.get('userId') || ''
    const orderNo = searchParams.get('orderNo') || 'Unknown'
    const total = searchParams.get('total') || '0.00'

    // Construct WhatsApp message URL here on client to ensure accuracy
    // We recreate a simplified message or we could have passed the full message encoded
    // But passing full message in URL is risky (length limits). 
    // Best is to have a simple "I verify order #..." message
    // OR we rely on the user manually clicking.

    const verifyUrl = `https://wa.me/60129092013?text=${encodeURIComponent(`Hi, I'd like to verify my Order #${orderNo}. Total: RM ${total}`)}`

    // Manual Verification is safest for Safari.
    // We do NOT auto-redirect to prevent blocking.

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">Order Placed!</h1>
                <p className="text-slate-500 mb-6">
                    Your order <span className="font-bold text-slate-800">#{orderNo}</span> has been submitted.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-slate-900">RM {total}</p>
                </div>

                <div className="space-y-3">
                    <a
                        href={verifyUrl}
                        // Important: No target="_blank" for Safari deep linking stability on some versions, 
                        // but actually specific to "App Links", usually direct nav is best.
                        // However, for WA, standard _blank is largely fine if USER initiates.
                        // But let's try direct navigation to be safe? 
                        // Actually, _blank is better for preserving the app state.
                        // The user complained about white page.
                        // I will use a simple anchor tag.
                        className="flex items-center justify-center w-full py-3.5 px-6 rounded-xl font-bold bg-[#25D366] text-white shadow-lg shadow-green-200 hover:bg-[#20bd5a] transition-all active:scale-95"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Verify on WhatsApp
                    </a>

                    <Link href="/shop">
                        <Button variant="outline" className="w-full rounded-xl py-6 font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                <p className="text-[10px] text-slate-400 mt-8">
                    Please verify your order on WhatsApp to confirm delivery details.
                </p>
            </div>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        // Suspense is CRITICAL for useSearchParams to work without crashing compilation or client-side hydration
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    )
}
