"use client"

import { useEffect, useState, Suspense } from 'react'
import { products as staticProducts } from "@/data/products"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/shop/ProductCard"
import Link from "next/link"

import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

function ShopContent() {
    const searchParams = useSearchParams()
    const category = searchParams.get('cat') || 'all'
    const [products, setProducts] = useState<any[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { user, isGuest, loading: authLoading } = useAuth()
    const router = useRouter()

    // Shop Selection State
    const [shops, setShops] = useState<any[]>([])
    const [selectedShop, setSelectedShop] = useState<any | null>(null)
    const [showShopSelector, setShowShopSelector] = useState(false)
    const [unavailableProductIds, setUnavailableProductIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!authLoading && !user && !isGuest) {
            router.push('/login?redirect=/shop')
            return
        }
        if (!authLoading) {
            fetchShops()
            fetchProducts()
            fetchSettings()
        }
    }, [authLoading, user, isGuest])

    const fetchShops = async () => {
        try {
            const { data } = await supabase.from('shops').select('*').eq('status', 'open').order('name')
            if (data && data.length > 0) {
                setShops(data)

                // Try to load saved shop
                const savedId = typeof window !== 'undefined' ? localStorage.getItem('sp_selected_shop_id') : null
                if (savedId) {
                    const found = data.find(s => s.id === savedId)
                    if (found) {
                        handleSelectShop(found, false)
                    } else {
                        setShowShopSelector(true) // Saved shop no longer valid/open
                    }
                } else {
                    setShowShopSelector(true)
                }
            } else {
                // No shops? Handle gracefully?
                console.warn("No active shops found")
            }
        } catch (e) {
            console.error("Error fetching shops", e)
        }
    }

    const fetchProducts = async () => {
        try {
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true })

            if (data && data.length > 0) {
                setProducts(data)
            } else {
                setProducts(staticProducts)
            }
        } catch (e) {
            setProducts(staticProducts)
        } finally {
            setLoading(false)
        }
    }

    const fetchSettings = async () => {
        try {
            const { data } = await supabase.from('business_settings').select('*').maybeSingle()
            setSettings(data)
        } catch (e) {
            console.error("Error fetching settings", e)
        }
    }

    const handleSelectShop = async (shop: any, save = true) => {
        setSelectedShop(shop)
        if (save && typeof window !== 'undefined') {
            localStorage.setItem('sp_selected_shop_id', shop.id)
        }
        setShowShopSelector(false)

        // Fetch availability
        try {
            const { data } = await supabase
                .from('shop_products')
                .select('product_id, is_available')
                .eq('shop_id', shop.id)

            // Gather IDs where is_available is explicitly false
            const hiddenSet = new Set<string>()
            data?.forEach((item: any) => {
                if (item.is_available === false) {
                    hiddenSet.add(item.product_id)
                }
            })
            setUnavailableProductIds(hiddenSet)
        } catch (err) {
            console.error(err)
        }
    }

    const filteredProducts = products.filter((p: any) => {
        // 1. Category Filter
        if (category !== 'all' && p.category !== category) return false
        // 2. Shop Availability Filter
        if (unavailableProductIds.has(p.id)) return false
        return true
    })

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Shop...</div>
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative">
            {/* Shop Selector Modal */}
            {showShopSelector && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Select Your Store</h2>
                        <p className="text-slate-500 text-center mb-6">Choose the nearest branch for pickup or delivery.</p>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {shops.map(shop => (
                                <button
                                    key={shop.id}
                                    onClick={() => handleSelectShop(shop)}
                                    className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-blue-50 transition-all group items-start flex gap-3"
                                >
                                    <div className="p-2 bg-white rounded-full text-primary shadow-sm group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{shop.name}</div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{shop.address}</div>
                                    </div>
                                </button>
                            ))}
                            {shops.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    No active shops found. <br />
                                    <span className="text-xs">Please contact admin.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 mb-1">Shop Fresh</h1>
                            <p className="text-slate-500 text-sm">Select from our premium fresh chicken options.</p>
                        </div>

                        {/* Selected Shop Badge */}
                        {selectedShop && (
                            <button
                                onClick={() => setShowShopSelector(true)}
                                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                <span className="max-w-[100px] sm:max-w-xs truncate">{selectedShop.name}</span>
                                <span className="text-blue-400 font-normal">Change</span>
                            </button>
                        )}
                    </div>

                    {/* Category Tabs - Horizontal Scroll on Mobile */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {[
                            { id: 'all', label: 'All Products' },
                            { id: 'whole', label: 'Whole Chicken' },
                            { id: 'parts', label: 'Chicken Parts' },
                            { id: 'mutton', label: 'Fresh Mutton' },
                            { id: 'eggs', label: 'Fresh Eggs' },
                            { id: 'frozen', label: 'Frozen Goods' }
                        ].map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/shop${cat.id === 'all' ? '' : `?cat=${cat.id}`}`}
                                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${category === cat.id
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} skinPreference={settings?.skin_choice_preference} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No products found in this category for {selectedShop?.name || 'this shop'}.</p>
                        {category !== 'all' && (
                            <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">
                                View all products
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Shop...</div>}>
            <ShopContent />
        </Suspense>
    )
}
