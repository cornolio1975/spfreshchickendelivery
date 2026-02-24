"use client"

import { Product } from "@/data/products"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface ProductCardProps {
    product: Product
    skinPreference?: 'both' | 'skinned' | 'skinless' | 'hidden'
}

export function ProductCard({ product, skinPreference }: ProductCardProps) {
    const { addItem } = useCart()
    const [selectedOption, setSelectedOption] = useState(product.options?.[0])

    // Price Variants State
    const hasPriceVariants = product.price_variants && product.price_variants.length > 0
    const [selectedPriceVariant, setSelectedPriceVariant] = useState<{ name: string, price: number } | null>(
        hasPriceVariants ? product.price_variants![0] : null
    )

    // Find first available weight option
    const firstAvailableWeight = product.weight_options?.find(w => !product.unavailable_weights?.includes(w))
    const [selectedWeight, setSelectedWeight] = useState(firstAvailableWeight || product.weight_options?.[0])

    const [skinOption, setSkinOption] = useState("Skinned (dgn Kulit)")
    const [quantity, setQuantity] = useState(1)
    const [isAdded, setIsAdded] = useState(false)

    // Update skin option based on preference
    // If preference changes to specific type, force that type
    // If 'both', default to Skinned (or keep current if valid?) - keeping simple for now
    useEffect(() => {
        if (skinPreference === 'skinned') {
            setSkinOption("Skinned (dgn Kulit)")
        } else if (skinPreference === 'skinless') {
            setSkinOption("Skinless (buang Kulit)")
        }
    }, [skinPreference])

    // Calculate dynamic price based on price variant first, then weight if available
    const basePrice = selectedPriceVariant ? selectedPriceVariant.price : product.price
    const unitPrice = selectedWeight ? basePrice * selectedWeight : basePrice
    const finalPrice = unitPrice * quantity
    const finalUnit = selectedWeight ? `kg` : product.unit

    const handleAddToCart = () => {
        let finalOption = ""

        // Add skin option if applicable (chicken products)
        if (product.category !== 'eggs' && product.category !== 'frozen') {
            finalOption += `${skinOption}`
        }

        // Add price variant option
        if (selectedPriceVariant) {
            finalOption += finalOption ? `, ${selectedPriceVariant.name}` : selectedPriceVariant.name
        }

        // Add prep option
        if (selectedOption) {
            finalOption += finalOption ? `, ${selectedOption}` : selectedOption
        }

        // Add weight option
        if (selectedWeight) {
            finalOption += finalOption ? `, ${selectedWeight}kg` : `${selectedWeight}kg`
        }

        addItem({
            id: product.id,
            name: product.name,
            price: unitPrice, // Cart usually expects unit price, quantity is separate
            unit: finalUnit,
            option: finalOption || undefined,
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
                                value={selectedWeight || ''}
                                onChange={(e) => setSelectedWeight(parseFloat(e.target.value))}
                            >
                                {product.weight_options.map(w => {
                                    const isUnavailable = product.unavailable_weights?.includes(w)
                                    return (
                                        <option key={w} value={w} disabled={isUnavailable}>
                                            {w} kg {isUnavailable ? '(Out of Stock)' : ''}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    )
                }

                {/* Skin Option Selector - Only for non-egg/frozen/mutton items AND if preference allows choice AND is not hidden */}
                {product.category !== 'eggs' && product.category !== 'frozen' && product.category !== 'mutton' && skinPreference !== 'hidden' && (skinPreference === 'both' || !skinPreference) && (
                    <div className="mb-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                            Skin Preference
                        </label>
                        <select
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={skinOption}
                            onChange={(e) => setSkinOption(e.target.value)}
                        >
                            <option value="Skinned (dgn Kulit)">Skinned (dgn Kulit)</option>
                            <option value="Skinless (buang Kulit)">Skinless (buang Kulit)</option>
                        </select>
                    </div>
                )}

                {/* Options Selector (Cuts etc) */}
                {
                    product.options && (
                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                                Preparation Option
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

                {/* Price Variants Selector */}
                {
                    hasPriceVariants && product.price_variants && (
                        <div className="mb-4">
                            <label className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5 block">
                                Variant Type
                            </label>
                            <select
                                className="w-full p-2 bg-blue-50/50 border border-blue-200 rounded-lg text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={selectedPriceVariant?.name || ''}
                                onChange={(e) => {
                                    const variant = product.price_variants!.find(v => v.name === e.target.value)
                                    if (variant) setSelectedPriceVariant(variant)
                                }}
                            >
                                {product.price_variants.map(variant => (
                                    <option key={variant.name} value={variant.name}>
                                        {variant.name} (+RM {variant.price.toFixed(2)})
                                    </option>
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
                        disabled={product.in_stock === false}
                        className={`rounded-full px-4 transition-all duration-300 ${product.in_stock === false
                            ? 'bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed'
                            : isAdded
                                ? 'bg-green-500 hover:bg-green-600'
                                : ''
                            }`}
                    >
                        {product.in_stock === false ? (
                            "Out of Stock"
                        ) : isAdded ? (
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
