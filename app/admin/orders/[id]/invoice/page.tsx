"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

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
    payment_method: string
    payment_status: string
    shop_id?: string
}

interface BusinessSettings {
    business_name: string
    address: string
    phone: string
    email: string
    tagline?: string
}

export default function InvoicePage() {
    const params = useParams()
    const [order, setOrder] = useState<Order | null>(null)
    const [settings, setSettings] = useState<BusinessSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string)
        }
    }, [params.id])

    const fetchData = async (orderId: string) => {
        try {
            // Fetch Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single()

            if (orderError) throw orderError

            // Fetch Business Settings
            const { data: settingsData } = await supabase
                .from('business_settings')
                .select('*')
                .limit(1)
                .maybeSingle()

            setOrder(orderData)
            setSettings(settingsData)
        } catch (err) {
            console.error("Error fetching invoice data:", err)
            alert("Failed to load invoice.")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Invoice...</div>
    }

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center">Order not found.</div>
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto bg-white p-12 rounded-xl shadow-sm print:shadow-none">

                {/* Print Button (Hidden in Print) */}
                <div className="mb-8 flex justify-end print:hidden">
                    <Button onClick={() => window.print()} className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print Invoice
                    </Button>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">{settings?.business_name || 'SP Fresh Chicken'}</h1>
                        <p className="text-slate-500">{settings?.tagline || 'Premium Fresh Chicken Supplier'}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-200 mb-2">INVOICE</h2>
                        <div className="text-slate-900 font-bold">#{order.order_no}</div>
                        <div className="text-slate-500 text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">From</h3>
                        <div className="text-slate-900 font-bold mb-1">{settings?.business_name}</div>
                        <div className="text-slate-600 whitespace-pre-line text-sm">{settings?.address}</div>
                        <div className="text-slate-600 text-sm mt-2">{settings?.phone}</div>
                        <div className="text-slate-600 text-sm">{settings?.email}</div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Bill To</h3>
                        <div className="text-slate-900 font-bold mb-1">Customer / Delivery Address</div>
                        <div className="text-slate-600 whitespace-pre-line text-sm">{order.delivery_address}</div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-100">
                            <tr>
                                <th className="py-4 text-sm font-bold text-slate-700">Item Description</th>
                                <th className="py-4 text-sm font-bold text-slate-700 text-center">Unit Price</th>
                                <th className="py-4 text-sm font-bold text-slate-700 text-center">Qty</th>
                                <th className="py-4 text-sm font-bold text-slate-700 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4">
                                        <div className="font-bold text-slate-900">{item.name}</div>
                                        {item.option && <div className="text-xs text-slate-500">Option: {item.option}</div>}
                                    </td>
                                    <td className="py-4 text-center text-slate-600">RM {item.price.toFixed(2)}</td>
                                    <td className="py-4 text-center text-slate-600">{item.quantity} {item.unit}</td>
                                    <td className="py-4 text-right font-bold text-slate-900">RM {(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>RM {(order.total - order.delivery_fee).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Delivery Fee</span>
                            <span>RM {order.delivery_fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-black text-xl pt-4 border-t border-slate-200">
                            <span>Total</span>
                            <span>RM {order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-slate-400 text-sm border-t pt-8">
                    <p>Thank you for your business!</p>
                    <p className="mt-2 text-xs">For any inquiries, please contact us at {settings?.phone}</p>
                </div>

            </div>
        </div>
    )
}
