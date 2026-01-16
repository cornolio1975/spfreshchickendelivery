"use client"

import { useEffect, useState, Suspense } from 'react'
import { products as staticProducts } from "@/data/products"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/shop/ProductCard"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function ShopContent() {
    const searchParams = useSearchParams()
    const category = searchParams.get('cat') || 'all'
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

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

    const filteredProducts = category === 'all'
        ? products
        : products.filter((p: any) => p.category === category)

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Shop...</div>
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Shop Fresh</h1>
                    <p className="text-slate-500 mb-6 text-sm">Select from our premium fresh chicken options below.</p>

                    {/* Category Tabs - Horizontal Scroll on Mobile */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {[
                            { id: 'all', label: 'All Products' },
                            { id: 'whole', label: 'Whole Chicken' }
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
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No products found in this category.</p>
                        <Link href="/shop" className="text-primary font-bold hover:underline mt-2 inline-block">
                            View all products
                        </Link>
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
