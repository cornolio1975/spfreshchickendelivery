"use client"

import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, MapPin, Store, ChevronLeft, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

/*
*/
interface Shop {
    id: string
    name: string
    address: string
    status: 'open' | 'closed' | 'hidden'
}

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart()
    const { user, profile } = useAuth()
    const [address, setAddress] = useState("")
    const [suggestions, setSuggestions] = useState<{ address: string, lat: string, lng: string }[]>([])
    const [selectedCoords, setSelectedCoords] = useState<{ lat: string, lng: string } | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false)
    const [deliveryFee, setDeliveryFee] = useState<number | null>(null)
    const [isLoadingQuote, setIsLoadingQuote] = useState(false)
    const [quoteError, setQuoteError] = useState("")
    const [isUsingDefaultFee, setIsUsingDefaultFee] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [defaultFee, setDefaultFee] = useState(15.00)

    // Multi-shop state
    const [shops, setShops] = useState<Shop[]>([])
    const [selectedShopId, setSelectedShopId] = useState<string>("")

    // Scheduling state
    const [deliveryType, setDeliveryType] = useState<'immediate' | 'scheduled'>('immediate')
    const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [scheduledTime, setScheduledTime] = useState<string>("09:00")

    // Delivery Details Modal State
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [recipientName, setRecipientName] = useState("")
    const [recipientPhone, setRecipientPhone] = useState("")
    const [roomFloorInfo, setRoomFloorInfo] = useState("")

    useEffect(() => {
        fetchShops()
        fetchDefaultFee()
    }, [])

    // Suggestion debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (address.length >= 3 && showSuggestions) {
                setIsSearchingSuggestions(true)
                try {
                    // CHANGED: Use /api/delivery/suggestions instead of /api/lalamove/suggestions to avoid ad-blockers
                    const res = await fetch(`/api/delivery/suggestions?q=${encodeURIComponent(address)}`)
                    const data = await res.json()
                    if (data.suggestions) {
                        setSuggestions(data.suggestions)
                    }
                } catch (err) {
                    console.error('Error fetching suggestions:', err)
                } finally {
                    setIsSearchingSuggestions(false)
                }
            } else {
                setSuggestions([])
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [address, showSuggestions])

    const fetchDefaultFee = async () => {
        try {
            const { data } = await supabase.from('business_settings').select('default_delivery_fee').single()
            if (data?.default_delivery_fee) setDefaultFee(Number(data.default_delivery_fee))
        } catch (err) {
            console.error('Error fetching default fee:', err)
        }
    }

    const fetchShops = async () => {
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .neq('status', 'hidden')
                .order('name')

            if (data && data.length > 0) {
                setShops(data)
                setSelectedShopId(data[0].id) // Default to first shop
            }
        } catch (err) {
            console.error('Error fetching shops:', err)
        }
    }

    // Effect to pre-fill recipient info when modal opens
    useEffect(() => {
        if (showDetailsModal && profile) {
            if (!recipientName) setRecipientName(profile.full_name || "")
            if (!recipientPhone) setRecipientPhone(profile.phone || "")
        }
    }, [showDetailsModal, profile])

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
            // Prepare scheduling data if applicable
            let scheduleAt = undefined
            if (deliveryType === 'scheduled') {
                // Lalamove expects ISO string or similar. 
                // We'll send the formatted UTC string.
                scheduleAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
            }

            // CHANGED: Use /api/data/q instead of /api/delivery/quote to avoid ad-blockers (attempt 3)
            const res = await fetch('/api/data/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    shopId: selectedShopId,
                    lat: selectedCoords?.lat,
                    lng: selectedCoords?.lng,
                    scheduleAt
                })
            })

            const response = await res.json()
            setIsUsingDefaultFee(false) // Reset on new attempt

            if (!res.ok) {
                console.warn('[Cart] API failed:', response.message)
                setDeliveryFee(defaultFee)
                setIsUsingDefaultFee(true)
                setQuoteError(`Unable to calculate exact delivery fee. Please proceed with checkout via WhatsApp; our admin will verify and update the exact fee before you proceed with payment.`)
            } else {
                const priceBreakdown = response.data?.priceBreakdown || response.priceBreakdown
                const price = parseFloat(priceBreakdown?.total || "0")

                console.log('[Cart] Quotation success:', price)
                setDeliveryFee(price)
                setQuoteError("") // Clear any previous errors
            }

        } catch (err: any) {
            console.error('[Cart] Network error details:', err)
            setDeliveryFee(defaultFee)
            setIsUsingDefaultFee(true)
            setQuoteError(`Connection problem with delivery partner. Please proceed with checkout; our admin will manually verify your delivery fee.`)
        }
        finally {
            setIsLoadingQuote(false)
        }
    }

    const getAvailableDates = () => {
        const dates = []
        for (let i = 0; i < 5; i++) {
            const date = new Date()
            date.setDate(date.getDate() + i)
            dates.push({
                value: date.toISOString().split('T')[0],
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'short' })
            })
        }
        return dates
    }

    const getAvailableTimes = () => {
        const times = []
        for (let hour = 8; hour <= 18; hour++) {
            const h24_0 = hour.toString().padStart(2, '0')
            const h24_30 = hour.toString().padStart(2, '0')

            // Generate AM/PM labels
            const period = hour >= 12 ? 'PM' : 'AM'
            const h12 = hour > 12 ? hour - 12 : hour
            const h12Str = h12.toString()

            times.push({ value: `${h24_0}:00`, label: `${h12Str}:00 ${period}` })
            times.push({ value: `${h24_30}:30`, label: `${h12Str}:30 ${period}` })
        }
        // Filter out times outside 8:30 AM - 6:00 PM
        return times.filter(t => t.value >= "08:30" && t.value <= "18:00")
    }

    const finalTotal = total + (deliveryFee || 0)

    const handleCheckout = async () => {
        if (!address.trim()) {
            alert("Please enter a delivery address.")
            return
        }

        if (deliveryFee === null && address.trim()) {
            await getDeliveryQuote()
        }

        setIsSubmitting(true)

        try {
            // 2. Insert Order into Supabase
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user?.id || null,
                        status: 'pending',
                        total: finalTotal,
                        delivery_fee: deliveryFee || 0,
                        delivery_address: address,
                        recipient_name: recipientName,
                        recipient_phone: recipientPhone,
                        room_floor_info: roomFloorInfo,
                        items: items,
                        shop_id: selectedShopId || null,
                        payment_method: 'cash',
                        payment_status: 'unpaid',
                        delivery_type: deliveryType,
                        scheduled_at: deliveryType === 'scheduled' ? `${scheduledDate}T${scheduledTime}:00Z` : null
                    }
                ])
                .select()
                .single()

            if (orderError) throw orderError

            const orderNo = orderData.order_no
            const orderId = orderData.id

            // 3. Construct WhatsApp Message
            const shop = shops.find(s => s.id === selectedShopId)
            const shopName = shop ? shop.name : "Default Shop"

            let message = `*New Order #${orderNo}*\n`
            if (deliveryType === 'scheduled') {
                message += `*SCHEDULED:* ${scheduledDate} @ ${scheduledTime}\n`
            }
            message += `*Shop:* ${shopName}\n\n`

            message += `*Delivery To:*\n`
            message += `${recipientName} (${recipientPhone})\n`
            message += `${address}\n`
            if (roomFloorInfo) message += `*Unit/Floor:* ${roomFloorInfo}\n`
            message += `\n`

            items.forEach((item, index) => {
                message += `${index + 1}. ${item.name}`
                if (item.option) message += ` (${item.option})`
                message += `\n   ${item.quantity} x RM${item.price.toFixed(2)} = RM${(item.quantity * item.price).toFixed(2)}\n`
            })

            message += `\n*Subtotal: RM ${total.toFixed(2)}*`

            if (deliveryFee !== null) {
                message += `\n*Delivery Fee: RM ${deliveryFee.toFixed(2)}*`
            }

            message += `\n\n*Total: RM ${finalTotal.toFixed(2)}*`

            if (isUsingDefaultFee) {
                message += `\n\n*Note:* Delivery fee is pending admin manual verification.`
            }

            message += `\n\n_Order ID: ${orderId.split('-')[0]}..._`

            // 4. Clear Cart and Redirect
            clearCart()

            const url = `https://wa.me/60129092013?text=${encodeURIComponent(message)}`
            window.open(url, '_blank')

            window.location.href = '/'

        } catch (error: any) {
            console.error("[Checkout] Full error details:", JSON.stringify(error, null, 2))
            const errorMsg = error.message || error.details || JSON.stringify(error)
            alert("Failed to create order. " + errorMsg)
        } finally {
            setIsSubmitting(false)
        }
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
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/shop" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ChevronLeft className="h-6 w-6 text-slate-600" />
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Your Cart</h1>
                </div>

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

                        {/* Delivery Details Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                <Truck className="h-5 w-5 mr-2 text-primary" />
                                Delivery Details
                            </h3>

                            <div className="space-y-6">
                                {/* Shop Selection */}
                                {shops.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                                            <Store className="h-4 w-4 mr-2" />
                                            Choose Pickup Shop
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {shops.map((shop) => (
                                                <div
                                                    key={shop.id}
                                                    onClick={() => {
                                                        setSelectedShopId(shop.id)
                                                        setDeliveryFee(null) // Reset fee on shop change
                                                    }}
                                                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${selectedShopId === shop.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                                                        } ${shop.status === 'closed' ? 'opacity-60 grayscale' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-bold text-sm text-slate-900">{shop.name}</div>
                                                        {shop.status === 'closed' && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">CLOSED</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 line-clamp-1">{shop.address}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Order Scheduling */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Delivery Timing</label>
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setDeliveryType('immediate')}
                                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${deliveryType === 'immediate'
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'bg-white text-slate-500 border border-slate-200'
                                                }`}
                                        >
                                            Order Now
                                        </button>
                                        <button
                                            onClick={() => setDeliveryType('scheduled')}
                                            className={`flex-1 py-2 px-4 rounded-xl text-sm font-bold transition-all ${deliveryType === 'scheduled'
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'bg-white text-slate-500 border border-slate-200'
                                                }`}
                                        >
                                            Schedule Future
                                        </button>
                                    </div>

                                    {deliveryType === 'scheduled' && (
                                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div>
                                                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">Choose Date</label>
                                                <select
                                                    value={scheduledDate}
                                                    onChange={(e) => setScheduledDate(e.target.value)}
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    {getAvailableDates().map(d => (
                                                        <option key={d.value} value={d.value}>{d.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1">Choose Time</label>
                                                <select
                                                    value={scheduledTime}
                                                    onChange={(e) => setScheduledTime(e.target.value)}
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    {getAvailableTimes().map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className="col-span-2 text-[10px] text-slate-500 mt-1 italic">
                                                * Deliveries available from 8:30 AM to 6:00 PM.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Your Delivery Address
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                                            placeholder="Enter your full delivery address..."
                                            value={address}
                                            onChange={(e) => {
                                                setAddress(e.target.value)
                                                setSelectedCoords(null) // Clear coordinates if user types manually
                                                setShowSuggestions(true)
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => {
                                                // Small delay to allow clicking a suggestion
                                                setTimeout(() => setShowSuggestions(false), 200)
                                            }}
                                        />

                                        {showSuggestions && (suggestions.length > 0 || isSearchingSuggestions) && (
                                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                                {isSearchingSuggestions && suggestions.length === 0 && (
                                                    <div className="p-3 text-sm text-slate-500 flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        Searching for addresses...
                                                    </div>
                                                )}
                                                {suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                                        onClick={() => {
                                                            setAddress(suggestion.address)
                                                            setSelectedCoords({ lat: suggestion.lat, lng: suggestion.lng })
                                                            setSuggestions([])
                                                            setShowSuggestions(false)
                                                            setShowDetailsModal(true) // Trigger modal
                                                        }}
                                                    >
                                                        {suggestion.address}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            variant="outline"
                                            onClick={getDeliveryQuote}
                                            disabled={isLoadingQuote || !address.trim()}
                                            className="rounded-full text-sm"
                                        >
                                            {isLoadingQuote ? "Calculating..." : "Get Delivery Price"}
                                        </Button>
                                    </div>
                                    {quoteError ? (
                                        <p className="text-amber-600 text-xs font-medium text-right mt-1 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                            {quoteError}
                                        </p>
                                    ) : deliveryFee !== null && (
                                        <p className="text-green-600 text-xs font-medium text-right mt-1">
                                            Delivery price updated!
                                        </p>
                                    )}
                                </div>
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
                                {selectedShopId && shops.find(s => s.id === selectedShopId) && (
                                    <div className="flex justify-between text-slate-500 text-xs">
                                        <span>From:</span>
                                        <span className="max-w-[150px] text-right truncate">{shops.find(s => s.id === selectedShopId)?.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-black text-primary">RM {finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 flex gap-3 text-left">
                                <div className="mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                    The delivery fee shown is an estimate. The exact fee will be confirmed by the admin via WhatsApp. Order will only be processed after you agree to the final payment.
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full rounded-full font-bold h-14 text-lg shadow-lg shadow-primary/20"
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Processing..." : "Checkout via WhatsApp"}
                                {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full rounded-full mt-4 font-bold text-slate-500"
                                asChild
                            >
                                <Link href="/shop">Continue Shopping</Link>
                            </Button>

                            <p className="text-xs text-center text-slate-400 mt-4">
                                You will be redirected to WhatsApp to confirm your order.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">Delivery Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{address}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Recipient Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 0123456789"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        value={recipientPhone}
                                        onChange={(e) => setRecipientPhone(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Unit / Floor / Block (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Block A, Level 5, Room 12"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        value={roomFloorInfo}
                                        onChange={(e) => setRoomFloorInfo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <Button
                                    className="w-full h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20"
                                    onClick={() => {
                                        if (!recipientName || !recipientPhone) {
                                            alert("Please fill in the recipient's name and phone number.")
                                            return
                                        }
                                        setShowDetailsModal(false)
                                        // Trigger price quote after saving details
                                        getDeliveryQuote()
                                    }}
                                >
                                    Confirm & Continue
                                </Button>
                                <button
                                    className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
