"use client"

import { Product } from "@/data/products"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart()
    const [selectedOption, setSelectedOption] = useState(product.options?.[0])
    const [selectedWeight, setSelectedWeight] = useState(product.weight_options?.[0])
    const [quantity, setQuantity] = useState(1)
    const [isAdded, setIsAdded] = useState(false)

    // Calculate dynamic price based on weight if available
    const unitPrice = selectedWeight ? product.price * selectedWeight : product.price
    const finalPrice = unitPrice * quantity
    const finalUnit = selectedWeight ? `kg` : product.unit

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: unitPrice, // Cart usually expects unit price, quantity is separate
            unit: finalUnit,
            option: selectedOption ? `${selectedOption}${selectedWeight ? ` (${selectedWeight}kg)` : ''}` : (selectedWeight ? `${selectedWeight}kg` : undefined),
            quantity: quantity
        })

        // Visual feedback
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const incrementQty = () => setQuantity(q => q + 1)
    const decrementQty = () => setQuantity(q => Math.max(1, q - 1))

    return (
        <div className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
            {/* Standardized Image Container (Fixed Aspect Ratio 1:1) */}
            <div className="relative aspect-square w-full p-4">
                <div className="relative h-full w-full bg-white rounded-xl overflow-hidden border-4 border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    {/* The Product Image */}
                    <Image
                        src={product.image || "/fresh-chicken.jpg"}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Company Logo Hologram Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] mix-blend-multiply group-hover:opacity-[0.1] transition-opacity duration-500">
                        <Image
                            src="/logo.png"
                            alt="Logo Watermark"
                            width={100}
                            height={100}
                            className="object-contain grayscale"
                        />
                    </div>
                </div>
            </div>

            {/* Content - Organized for a neat, aligned look */}
            <div className="flex flex-col flex-grow p-5 pt-2">
                <div className="h-14 mb-2 flex items-center">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{product.name}</h3>
                </div>

                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>

                {/* Weight Selector */}
                {
                    product.weight_options && product.weight_options.length > 0 && (
                        <div className="mb-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                Size
                            </label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={selectedWeight}
                                onChange={(e) => setSelectedWeight(parseFloat(e.target.value))}
                            >
                                {product.weight_options.map(w => (
                                    <option key={w} value={w}>{w} kg</option>
                                ))}
                            </select>
                        </div>
                    )
                }

                {/* Options Selector */}
                {
                    product.options && (
                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                Preparation
                            </label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            >
                                {product.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )
                }

                {/* Quantity Selector */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Qty
                    </label>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button onClick={decrementQty} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-md transition-colors font-bold">-</button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{quantity}</span>
                        <button onClick={incrementQty} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-md transition-colors font-bold">+</button>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div>
                        <span className="text-lg font-black text-primary">RM {finalPrice.toFixed(2)}</span>
                        {/* <span className="text-xs text-slate-400 font-medium ml-1">/ {selectedWeight ? 'pc' : product.unit}</span> */}
                    </div>

                    <Button
                        size="sm"
                        onClick={handleAddToCart}
                        className={`rounded-full px-4 transition-all duration-300 ${isAdded ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                        {isAdded ? (
                            <>
                                <Check className="h-4 w-4 mr-1" />
                                Added
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </>
                        )}
                    </Button>
                </div>
            </div >
        </div >
    )
}
