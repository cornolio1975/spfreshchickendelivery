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
                    <h1 className="text-2xl font-black text-slate-900 mb-4">Shop Fresh</h1>
                    <p className="text-slate-500 mb-4">Select from our premium fresh chicken options below.</p>
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
