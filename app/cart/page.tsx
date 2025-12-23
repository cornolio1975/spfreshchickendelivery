"use client"

import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function CartPage() {
    const { items, removeItem, updateQuantity, total } = useCart()
    const [address, setAddress] = useState("")
    const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
    const [isLoadingQuote, setIsLoadingQuote] = useState(false)
    const [quoteError, setQuoteError] = useState("")

    // Reset delivery fee if address changes significantly (optional, but good for UX)
    // For now, we keep it simple. User must click "Get Price" again.

    const getDeliveryQuote = async () => {
        if (!address.trim()) {
            setQuoteError("Please enter a delivery address.")
            return
        }

        setIsLoadingQuote(true)
        setQuoteError("")
        setDeliveryFee(null)

        try {
            const res = await fetch('/api/lalamove/quotation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            })

            const response = await res.json()

            if (!res.ok) {
                throw new Error(response.message || 'Failed to get quote')
            }

            console.log('[Cart] Lalamove Response:', response)

            // Lalamove V3 structure: response.data.priceBreakdown.total
            const priceBreakdown = response.data?.priceBreakdown || response.priceBreakdown
            const price = parseFloat(priceBreakdown?.total || "0")

            console.log('[Cart] Extracted price:', price)
            setDeliveryFee(price)
        } catch (err: any) {
            console.error('[Cart] Error:', err)
            setQuoteError(err.message)
        } finally {
            setIsLoadingQuote(false)
        }
    }

    const finalTotal = total + (deliveryFee || 0)

    const handleCheckout = () => {
        if (!address.trim()) {
            alert("Please enter a delivery address.")
            return
        }

        // Construct WhatsApp message
        let message = "*New Order from Website*\n\n"
        items.forEach((item, index) => {
            message += `${index + 1}. ${item.name}`
            if (item.option) message += ` (${item.option})`
            message += `\n   ${item.quantity} x RM${item.price.toFixed(2)} = RM${(item.quantity * item.price).toFixed(2)}\n`
        })

        message += `\n*Subtotal: RM ${total.toFixed(2)}*`

        if (deliveryFee !== null) {
            message += `\n*Delivery Fee: RM ${deliveryFee.toFixed(2)}*`
            message += `\n*Address:* ${address}`
        } else {
            message += `\n*Delivery:* To be confirmed`
            message += `\n*Address:* ${address}`
        }

        message += `\n\n*Total: RM ${finalTotal.toFixed(2)}*`

        const url = `https://wa.me/60129092013?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h1>
                    <p className="text-slate-500 mb-8">Looks like you haven't added any fresh chicken yet.</p>
                    <Button size="lg" className="w-full rounded-full font-bold" asChild>
                        <Link href="/shop">Start Shopping</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-black text-slate-900 mb-8">Your Cart</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.option}`} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        {item.option && <span className="mr-2 px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">{item.option}</span>}
                                        RM {item.price.toFixed(2)} / {item.unit}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-slate-50 rounded-lg p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.option)}
                                            className="p-1 hover:bg-white rounded-md transition-colors"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4 text-slate-600" />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.option)}
                                            className="p-1 hover:bg-white rounded-md transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-slate-600" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id, item.option)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Delivery Address Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2 text-primary" />
                                Delivery Details
                            </h3>
                            <div className="space-y-4">
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                                    placeholder="Enter your full delivery address..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={getDeliveryQuote}
                                        disabled={isLoadingQuote || !address.trim()}
                                        className="rounded-full"
                                    >
                                        {isLoadingQuote ? "Calculating..." : "Get Delivery Price"}
                                    </Button>
                                </div>
                                {quoteError && (
                                    <p className="text-red-500 text-sm font-medium text-right">{quoteError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>RM {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Delivery</span>
                                    {deliveryFee !== null ? (
                                        <span className="font-bold text-slate-900">RM {deliveryFee.toFixed(2)}</span>
                                    ) : (
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">Enter address</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-black text-primary">RM {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button size="lg" className="w-full rounded-full font-bold h-14 text-lg shadow-lg shadow-primary/20" onClick={handleCheckout}>
                                Checkout via WhatsApp
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <p className="text-xs text-center text-slate-400 mt-4">
                                You will be redirected to WhatsApp to confirm your order.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
