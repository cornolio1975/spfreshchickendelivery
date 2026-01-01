"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Truck, Clock, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { products } from "@/data/products"
import { ProductCard } from "@/components/shop/ProductCard"
import { useState } from "react"

export default function Home() {
  const [settings, setSettings] = useState<any>(null)
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [showResetNotice, setShowResetNotice] = useState(false)

  useEffect(() => {
    // 1. FAILSAFE REDIRECT: Check for recovery token on the homepage
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      console.log('Failsafe redirect triggered from Home page')
      setShowResetNotice(true)
      window.location.href = '/reset-password' + window.location.hash
    }

    // Fetch settings and products client-side since we converted to use client
    const fetchData = async () => {
      try {
        const { data } = await supabase.from('business_settings').select('*').maybeSingle()
        setSettings(data)

        const { data: fetchedProducts } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true })
        setDbProducts(fetchedProducts || products)
      } catch (err) {
        console.error(err)
        setDbProducts(products)
      }
    }
    fetchData()
  }, [])


  const description = settings?.description || "Serving restaurants, markets, and households across Klang Valley with fresh, halal-certified chicken delivered daily."
  const tagline = settings?.tagline || "Premium Quality Halal Chicken Since 2013"

  return (
    <div className="flex flex-col min-h-screen">
      {/* Recovery Notice Failsafe */}
      {showResetNotice && (
        <div className="bg-yellow-400 p-4 text-center">
          <p className="font-black text-blue-900 mb-2">Password Reset Token Detected!</p>
          <Button variant="secondary" className="bg-white text-blue-900 font-bold" asChild>
            <Link href={`/reset-password${typeof window !== 'undefined' ? window.location.hash : ''}`}>
              Click here to go to Reset Page
            </Link>
          </Button>
        </div>
      )}

      {/* Hero Section with Images */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div className="text-white space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="/badge-since-2013.jpg"
                  alt="Since 2013"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white/30"
                />
                <Image
                  src="/halal-badge.jpg"
                  alt="100% Halal Certified"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Fresh Chicken<br />
                <span className="text-yellow-300">Delivered Daily</span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-100 font-medium">
                {tagline}
              </p>

              <p className="text-lg text-blue-50">
                {description}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-black text-lg px-8 rounded-full shadow-lg" asChild>
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold rounded-full" asChild>
                  <Link href="/wholesale">Wholesale Pricing</Link>
                </Button>
              </div>

              <div className="pt-4 flex items-center space-x-6 text-sm font-medium text-blue-100">
                <div className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Lalamove Delivery
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Same-Day Fresh
                </div>
              </div>
            </div>

            {/* Right: Images Collage - More Professional Layout */}
            <div className="relative h-[500px] md:h-[650px] w-full flex items-center justify-center">
              {/* Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-[60px]"></div>

              {/* Main Hero Image - Centered and Large */}
              <div className="relative z-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] transition-transform duration-700 hover:scale-105">
                <Image
                  src="/chickens.png"
                  alt="Fresh Chickens"
                  fill
                  className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
                  priority
                />
              </div>

              {/* Secondary Image 1 - Top Right with thick border */}
              <div className="absolute top-0 right-4 md:top-4 md:right-8 w-32 h-32 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[8px] border-white z-30 transform rotate-12 transition-all hover:rotate-3 duration-500">
                <Image
                  src="/white-chickens.jpg"
                  alt="Quality Chickens"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Secondary Image 2 - Bottom Left with thick border */}
              <div className="absolute bottom-8 left-0 md:bottom-12 md:left-4 w-40 h-32 md:w-72 md:h-52 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[8px] border-white z-10 transform -rotate-12 transition-all hover:rotate-0 duration-500">
                <Image
                  src="/fresh-chicken.jpg"
                  alt="Fresh Organic Chicken"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Decorative Accent - Badge */}
              <div className="absolute bottom-0 right-10 bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-black text-sm md:text-base shadow-xl z-40 transform -rotate-3 border-2 border-white animate-bounce-slow">
                100% FRESH DAILY
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12 tracking-tight text-slate-900">Our Fresh Selection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dbProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale / How it works */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6 text-slate-900">Wholesale Pricing for Everyone</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you run a restaurant, a catering business, or just cooking for a big family, we offer competitive wholesale prices every single day. No minimum order quantity required for great deals!
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Direct farm prices",
                  "Halal certified & Hygienic processing",
                  "Custom cuts available (12, 18, etc.)",
                  "Free delivery for bulk orders"
                ].map((item) => (
                  <li key={item} className="flex items-center text-slate-700 font-medium">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link href="/wholesale">View Wholesale Rates</Link>
              </Button>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6">How It Works</h3>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-lg">1</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900">Choose Your Products</h4>
                    <p className="text-sm text-slate-500">Select from our range of fresh chicken, parts, and eggs.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-lg">2</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900">Order via WhatsApp</h4>
                    <p className="text-sm text-slate-500">Send your order directly to our team for instant confirmation.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-lg">3</div>
                  <div className="ml-4">
                    <h4 className="font-bold text-slate-900">Fast Delivery</h4>
                    <p className="text-sm text-slate-500">We deliver via Lalamove or our own fleet to ensure freshness.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hygiene Assurance */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full mb-6">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-slate-900">100% Halal & Hygienic</h2>
          <p className="max-w-2xl mx-auto text-slate-600 mb-10">
            We strictly follow Halal slaughtering procedures and maintain the highest standards of hygiene in our processing facility. Your safety and trust are our top priorities.
          </p>
          <div className="flex justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
            {/* Placeholders for certification logos */}
            <div className="h-16 w-32 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400">HALAL</div>
            <div className="h-16 w-32 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-400">MESTI</div>
          </div>
        </div>
      </section>
    </div>
  );
}
