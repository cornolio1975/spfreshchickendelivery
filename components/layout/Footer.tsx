"use client"

import { useEffect, useState } from 'react'
import Link from "next/link"
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react"
import { supabase } from '@/lib/supabase'

interface BusinessSettings {
    business_name: string
    phone: string
    email: string
    address: string
    facebook_url?: string
    instagram_url?: string
}

export function Footer() {
    const [settings, setSettings] = useState<BusinessSettings | null>(null)

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data } = await supabase
                    .from('business_settings')
                    .select('*')
                    .single()

                if (data) setSettings(data)
            } catch (error) {
                console.error("Failed to fetch footer settings:", error)
            }
        }
        fetchSettings()
    }, [])

    return (
        <footer className="bg-slate-950 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tight text-white">
                            {settings?.business_name || 'SP FRESH CHICKEN'}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your trusted supplier for fresh, high-quality chicken and eggs. Delivered daily to your doorstep or business.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-lg">Quick Links</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop Fresh Chicken</Link></li>
                            <li><Link href="/wholesale" className="hover:text-primary transition-colors">Wholesale Enquiries</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="font-bold mb-6 text-lg">Our Products</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/shop?cat=whole" className="hover:text-primary transition-colors">Whole Chicken</Link></li>
                            <li><Link href="/shop?cat=parts" className="hover:text-primary transition-colors">Chicken Parts</Link></li>
                            <li><Link href="/shop?cat=eggs" className="hover:text-primary transition-colors">Fresh Eggs</Link></li>
                            <li><Link href="/shop?cat=frozen" className="hover:text-primary transition-colors">Frozen Goods</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-6 text-lg">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-3 shrink-0 text-primary" />
                                <span>{settings?.address || 'Shah Alam, Selangor'}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-3 shrink-0 text-primary" />
                                <span>{settings?.phone || '012-909 2013'}</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-3 shrink-0 text-primary" />
                                <span>{settings?.email || 'info@spchicken.com'}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-600">
                    <p>&copy; {new Date().getFullYear()} {settings?.business_name || 'SP Fresh Chicken Supplier'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
