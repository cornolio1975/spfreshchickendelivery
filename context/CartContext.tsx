"use client"

import { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    unit: string
    option?: string
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
    removeItem: (id: string, option?: string) => void
    updateQuantity: (id: string, quantity: number, option?: string) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from local storage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("cart")
            if (saved) {
                const parsed = JSON.parse(saved)
                // Sanitize data: Ensure price is a number
                const sanitized = Array.isArray(parsed) ? parsed.map((item: any) => ({
                    ...item,
                    price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price || 0),
                    quantity: Number(item.quantity || 1)
                })) : []
                setItems(sanitized)
            }
        } catch (e) {
            console.error("Failed to load cart from localStorage", e)
            setItems([])
        }
        setIsLoaded(true)
    }, [])

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem("cart", JSON.stringify(items))
            } catch (e) {
                console.error("Failed to save cart to localStorage", e)
            }
        }
    }, [items, isLoaded])

    const addItem = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.id === newItem.id && i.option === newItem.option
            )
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id && i.option === newItem.option
                        ? { ...i, quantity: i.quantity + (newItem.quantity || 1) }
                        : i
                )
            }
            return [...prev, { ...newItem, quantity: newItem.quantity || 1 }]
        })
    }

    const removeItem = (id: string, option?: string) => {
        setItems((prev) => prev.filter((i) => !(i.id === id && i.option === option)))
    }

    const updateQuantity = (id: string, quantity: number, option?: string) => {
        if (quantity < 1) {
            removeItem(id, option)
            return
        }
        setItems((prev) =>
            prev.map((i) =>
                i.id === id && i.option === option ? { ...i, quantity } : i
            )
        )
    }

    const clearCart = () => setItems([])

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
