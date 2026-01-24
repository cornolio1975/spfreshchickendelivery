"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { MapPin, Truck, Check, Navigation, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface Shop {
    id: string
    name: string
    address: string
    lat?: number
    lng?: number
    status: 'open' | 'closed' | 'hidden'
}

export function ShopLocatorSection() {
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

    // Delivery Estimate State
    const [address, setAddress] = useState("")
    const [suggestions, setSuggestions] = useState<{ address: string, lat: string, lng: string }[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [estimatedFee, setEstimatedFee] = useState<number | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [coords, setCoords] = useState<{ lat: string, lng: string } | null>(null)

    useEffect(() => {
        fetchShops()
    }, [])

    const fetchShops = async () => {
        try {
            const { data } = await supabase
                .from('shops')
                .select('*')
                .eq('status', 'open')
                .order('name')

            if (data) {
                setShops(data)
                // Check if user already has a shop selected
                const savedId = typeof window !== 'undefined' ? localStorage.getItem('sp_selected_shop_id') : null
                if (savedId) {
                    const found = data.find((s: Shop) => s.id === savedId)
                    if (found) setSelectedShop(found)
                }
            }
        } catch (error) {
            console.error("Error fetching shops", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectShop = (shop: Shop) => {
        setSelectedShop(shop)
        setEstimatedFee(null) // Reset fee if shop changes
        if (typeof window !== 'undefined') {
            localStorage.setItem('sp_selected_shop_id', shop.id)
        }
    }

    const handleAddressSearch = async (query: string) => {
        setAddress(query)
        if (query.length < 3) {
            setSuggestions([])
            return
        }

        try {
            const res = await fetch(`/api/delivery/suggestions?q=${encodeURIComponent(query)}`)
            const data = await res.json()
            if (data.suggestions) setSuggestions(data.suggestions)
            setShowSuggestions(true)
        } catch (err) {
            console.error(err)
        }
    }

    const calculateDelivery = async () => {
        if (!selectedShop || !address) return

        setIsCalculating(true)
        try {
            const res = await fetch(`/api/data/q`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    shopId: selectedShop.id,
                    lat: coords?.lat,
                    lng: coords?.lng
                })
            })
            const data = await res.json()

            if (data.data?.priceBreakdown?.total) {
                setEstimatedFee(parseFloat(data.data.priceBreakdown.total))
            } else {
                // Handle error
                alert("Could not calculate fee for this address. Please try a different address or contact us.")
            }
        } catch (error) {
            console.error("Error calculating fee", error)
        } finally {
            setIsCalculating(false)
        }
    }

    const proceedToShop = () => {
        // Just ensuring it's saved
        if (selectedShop && typeof window !== 'undefined') {
            localStorage.setItem('sp_selected_shop_id', selectedShop.id)
        }
        router.push('/shop')
    }

    if (shops.length === 0 && !loading) return null

    return (
        <section id="locations" className="py-16 bg-slate-50 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-100 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block">Our Locations</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Choose Your Nearest Shop</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Select a branch to check delivery availability and fees for your location.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shops.map((shop) => (
                        <div
                            key={shop.id}
                            onClick={() => handleSelectShop(shop)}
                            className={`
                                relative group overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer border-2
                                ${selectedShop?.id === shop.id
                                    ? 'bg-white border-primary shadow-xl scale-[1.02]'
                                    : 'bg-white border-transparent hover:border-slate-200 shadow-lg hover:shadow-xl'
                                }
                            `}
                        >
                            {/* Selected Indicator */}
                            {selectedShop?.id === shop.id && (
                                <div className="absolute top-4 right-4 z-20 bg-primary text-white p-1.5 rounded-full shadow-lg animate-in fade-in zoom-in">
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className={`
                                        p-3 rounded-2xl transition-colors
                                        ${selectedShop?.id === shop.id ? 'bg-blue-50 text-primary' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}
                                    `}>
                                        <MapPin className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">{shop.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">{shop.address}</p>
                                    </div>
                                </div>

                                {/* Delivery Estimator - Only shown when selected */}
                                <div className={`
                                    transition-all duration-300 overflow-hidden
                                    ${selectedShop?.id === shop.id ? 'max-h-[300px] opacity-100 mt-6 pt-6 border-t border-slate-100' : 'max-h-0 opacity-0'}
                                `}>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-3">Check Delivery Rate</p>

                                    <div className="relative mb-3">
                                        <input
                                            type="text"
                                            placeholder="Enter delivery area / landmark..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={address}
                                            onChange={(e) => handleAddressSearch(e.target.value)}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                                {suggestions.map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 text-xs hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setAddress(s.address)
                                                            setCoords({ lat: s.lat, lng: s.lng })
                                                            setSuggestions([])
                                                            setShowSuggestions(false)
                                                        }}
                                                    >
                                                        {s.address}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        {estimatedFee !== null ? (
                                            <div className="flex-1 bg-green-50 p-3 rounded-xl flex items-center gap-3 border border-green-100">
                                                <div className="bg-green-100 p-1.5 rounded-full">
                                                    <Truck className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-green-600 font-bold uppercase">Estimated Fee</span>
                                                    <span className="block text-lg font-black text-slate-900">RM {estimatedFee.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    calculateDelivery()
                                                }}
                                                disabled={isCalculating || !address}
                                            >
                                                {isCalculating ? "Calculating..." : "Check Fee"}
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            className="bg-primary hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-200"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                proceedToShop()
                                            }}
                                        >
                                            Shop Here <Navigation className="w-3 h-3 ml-2" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Fallback CTA when not selected */}
                                {selectedShop?.id !== shop.id && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium text-slate-500">Click to select</span>
                                        <span className="text-primary font-bold text-sm flex items-center">
                                            Select Shop <ArrowRight className="w-4 h-4 ml-1" />
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
