import { supabase } from '@/lib/supabase'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

// Revalidate every request (no caching)
export const revalidate = 0

async function getBusinessSettings() {
    let data = null
    try {
        const result = await supabase
            .from('business_settings')
            .select('*')
            .single()
        data = result.data
    } catch (error) {
        console.error('Failed to fetch business settings:', error)
    }

    return data
}

export default async function ContactPage() {
    const settings = await getBusinessSettings()

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 text-center">
                        Contact Us
                    </h1>
                    <p className="text-xl text-slate-600 text-center mb-12">
                        {settings?.tagline || 'Get in touch with us'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Get In Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Address</h3>
                                        <p className="text-slate-600">{settings?.address || 'Shah Alam, Selangor'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                                        <p className="text-slate-600">{settings?.phone || '012-627-3691'}</p>
                                        <p className="text-sm text-slate-500 mt-1">WhatsApp: {settings?.whatsapp || settings?.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                                        <p className="text-slate-600">{settings?.email || 'info@spchicken.com'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Operating Hours</h3>
                                        <div className="text-slate-600 space-y-1">
                                            {settings?.operating_hours && Object.entries(settings.operating_hours)
                                                .sort(([dayA], [dayB]) => {
                                                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                                    return days.indexOf(dayA.toLowerCase()) - days.indexOf(dayB.toLowerCase());
                                                })
                                                .map(([day, hours]) => (
                                                    <div key={day} className="flex justify-between">
                                                        <span className="capitalize font-medium">{day}:</span>
                                                        <span>{hours as string}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Contact */}
                        <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl shadow-sm text-white">
                            <h2 className="text-2xl font-black mb-4">Order Now</h2>
                            <p className="text-blue-100 mb-6">
                                {settings?.description || 'Contact us via WhatsApp for quick orders and inquiries'}
                            </p>

                            <a
                                href={`https://wa.me/${settings?.whatsapp?.replace(/[^0-9]/g, '') || '60129092013'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors"
                            >
                                WhatsApp Us Now
                            </a>

                            <div className="mt-8 pt-8 border-t border-white/20">
                                <h3 className="font-bold mb-3">Service Areas</h3>
                                <p className="text-blue-100">
                                    We deliver to Puchong, Shah Alam, Klang, Subang Jaya and surrounding areas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
