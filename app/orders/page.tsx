"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ChevronRight, Package, Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface OrderItem {
    id: string
    name: string
    price: number
    quantity: number
    unit: string
    option?: string
}

interface Order {
    id: string
    order_no: number
    created_at: string
    status: string
    total: number
    delivery_fee: number
    delivery_address: string
    items: OrderItem[]
    delivery_type: string
    scheduled_at: string | null
}

export default function OrdersPage() {
    const { user, profile, loading: authLoading } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        if (!user) return

        fetchOrders()

        // 3. Subscribe to Real-time updates
        const channel = supabase
            .channel('customer-orders')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to inserts and updates
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Order Change Received:', payload)
                    if (payload.eventType === 'UPDATE') {
                        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
                    } else if (payload.eventType === 'INSERT') {
                        setOrders(prev => [payload.new as Order, ...prev])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, authLoading])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (err) {
            console.error("Error fetching orders:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this order?")) return

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId)

            if (error) throw error

            // Real-time listener will handle state update, 
            // but we can also update locally for immediate feedback
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
            alert("Order cancelled successfully.")
        } catch (err: any) {
            console.error("Cancellation failed:", err)
            alert("Failed to cancel order: " + err.message)
        }
    }

    if (authLoading || (user && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold">Loading your orders...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-slate-300" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Please login</h1>
                    <p className="text-slate-500 mb-8">You need to be logged in to view your order history.</p>
                    <Button size="lg" className="w-full rounded-full font-bold" asChild>
                        <Link href="/login">Login Now</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/shop" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-slate-600" />
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Orders</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No orders found</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">You haven't placed any orders yet. Ready to get some fresh chicken?</p>
                        <Button size="lg" className="rounded-full font-bold px-8 shadow-lg shadow-primary/20" asChild>
                            <Link href="/shop">Browse Shop</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const scheduledAt = order.scheduled_at ? new Date(order.scheduled_at) : null
                            return (
                                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
                                    <div className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-lg font-black text-slate-900">Order #{order.order_no}</span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-slate-400 text-sm font-medium gap-4">
                                                    <span className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1.5" />
                                                        {new Date(order.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    {order.delivery_type === 'scheduled' && scheduledAt && (
                                                        <span className="flex items-center text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-lg">
                                                            <Clock className="h-4 w-4 mr-1.5" />
                                                            {scheduledAt.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total</div>
                                                <div className="text-2xl font-black text-primary">RM {order.total.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                                                <Package className="h-3 w-3 mr-2" />
                                                Order Summary
                                            </div>
                                            <div className="space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-700 font-bold">
                                                            {item.quantity}x {item.name}
                                                            {item.option && <span className="text-slate-400 font-medium ml-2">({item.option})</span>}
                                                        </span>
                                                        <span className="text-slate-900 font-black">RM {(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                                            <div className="flex items-center text-xs text-slate-500 font-medium">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 mr-2 group-hover:bg-primary transition-colors"></div>
                                                Ref ID: {order.id.split('-')[0]}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {order.status === 'pending' ? (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                ) : order.status === 'processing' ? (
                                                    <span className="text-[10px] font-black text-slate-400 uppercase italic">
                                                        Contact admin to cancel
                                                    </span>
                                                ) : null}

                                                <Link href="/shop" className="text-primary font-black text-sm flex items-center hover:gap-2 transition-all">
                                                    Order Again
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
