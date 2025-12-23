import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Phone, Truck, Clock, ShieldCheck } from "lucide-react"

export default function WholesalePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6">Wholesale Solutions</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Premium fresh chicken for restaurants, caterers, and businesses at unbeatable direct-from-farm prices.
                    </p>
                    <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 h-14 text-lg" asChild>
                        <a href="https://wa.me/60129092013" target="_blank" rel="noreferrer">
                            <Phone className="mr-2 h-5 w-5" />
                            Contact Sales Team
                        </a>
                    </Button>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Halal Certified</h3>
                            <p className="text-slate-600">
                                100% Halal compliant slaughtering and processing. We adhere to the strictest hygiene standards.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Truck className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Reliable Delivery</h3>
                            <p className="text-slate-600">
                                Scheduled daily deliveries to ensure your kitchen never runs out of stock. Lalamove integration for urgent orders.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Peak Freshness</h3>
                            <p className="text-slate-600">
                                Slaughtered daily in the early morning. Delivered straight to your doorstep within hours.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing / CTA */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Get Our Price List</h2>
                            <p className="text-slate-600 mb-6">
                                Prices fluctuate daily based on market rates. Contact us to get the latest quotation for your business.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {["Restaurants", "Hotels", "Caterers", "Hawkers", "Mini Markets"].map((item) => (
                                    <span key={item} className="flex items-center text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <Button size="lg" className="rounded-full px-8 h-12" asChild>
                                <a href="https://wa.me/60129092013?text=Hi%2C%20I%20am%20interested%20in%20wholesale%20pricing" target="_blank" rel="noreferrer">
                                    Inquire Now
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
