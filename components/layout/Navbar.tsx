"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Phone, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { items } = useCart()
    const { user, profile, signOut } = useAuth()

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <div className="container mx-auto flex h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-4 group transition-transform hover:scale-[1.02]">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl shadow-md border border-slate-100">
                        <Image
                            src="/logo.png"
                            alt="SP Fresh Chicken Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tight group-hover:text-primary transition-colors drop-shadow-sm">
                            SP FRESH CHICKEN
                        </span>
                        <span className="text-sm md:text-base font-bold text-primary tracking-[0.2em] uppercase mt-0.5">
                            DELIVERY
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-10 font-bold text-sm text-gray-600">
                    <Link href="/" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary">Home</Link>
                    <Link href="/shop" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary">Shop</Link>
                    <Link href="/wholesale" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary">Wholesale</Link>
                    <Link href="/contact" className="hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary">Contact</Link>
                    {profile?.role === 'admin' && (
                        <Link href="/admin" className="hover:text-primary transition-colors text-accent py-2 border-b-2 border-transparent hover:border-accent">Admin</Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <a href="https://wa.me/60129092013" target="_blank" rel="noreferrer" className="hidden md:flex items-center text-sm font-bold text-primary hover:text-accent">
                        <Phone className="mr-2 h-4 w-4" />
                        012-909 2013
                    </a>

                    <Link href="/cart">
                        <Button variant="outline" size="icon" className="relative border-primary/20 hover:bg-primary/5">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {user ? (
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">
                                {profile?.full_name || user.email}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => signOut()} className="rounded-full">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:block">
                            <Button variant="default" size="sm" className="rounded-full">
                                <User className="mr-2 h-4 w-4" />
                                Login
                            </Button>
                        </Link>
                    )}

                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-white shadow-lg">
                    <Link href="/" className="block text-sm font-bold text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/shop" className="block text-sm font-bold text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                    <Link href="/wholesale" className="block text-sm font-bold text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Wholesale</Link>
                    <Link href="/contact" className="block text-sm font-bold text-gray-700 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    {profile?.role === 'admin' && (
                        <Link href="/admin" className="block text-sm font-bold text-accent hover:text-primary" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                    )}
                    {user ? (
                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium text-slate-600 mb-2">{profile?.full_name || user.email}</p>
                            <Button variant="outline" size="sm" onClick={() => signOut()} className="w-full rounded-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="pt-4 border-t">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="default" size="sm" className="w-full rounded-full">
                                    <User className="mr-2 h-4 w-4" />
                                    Login
                                </Button>
                            </Link>
                        </div>
                    )}
                    <div className="pt-4 border-t">
                        <a href="https://wa.me/60129092013" className="flex items-center text-sm font-bold text-primary">
                            <Phone className="mr-2 h-4 w-4" />
                            012-909 2013
                        </a>
                    </div>
                </div>
            )}
        </nav>
    )
}
