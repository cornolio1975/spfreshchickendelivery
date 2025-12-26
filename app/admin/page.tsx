"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Package, X, Settings, Store } from 'lucide-react'

interface Product {
    id: string
    name: string
    category: string
    price: number
    unit: string
    image: string
    description?: string
    options?: string[]
    in_stock: boolean
}

interface BusinessSettings {
    id: string
    business_name: string
    tagline: string
    description: string
    phone: string
    email: string
    address: string
    whatsapp: string
    operating_hours: Record<string, string>
    facebook_url?: string
    instagram_url?: string
}

interface Shop {
    id: string
    name: string
    address: string
    lat: string
    lng: string
    is_active: boolean
}

export default function AdminPage() {
    const { user, profile, loading: authLoading } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'shops'>('products')

    // Products state
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        category: 'whole',
        price: 0,
        unit: 'kg',
        image: '',
        description: '',
        in_stock: true
    })
    const [optionsList, setOptionsList] = useState<string[]>([])
    const [newOption, setNewOption] = useState('')

    // Business settings state
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null)
    const [settingsForm, setSettingsForm] = useState({
        business_name: '',
        tagline: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
        facebook_url: '',
        instagram_url: ''
    })

    // Shops state
    const [shops, setShops] = useState<Shop[]>([])
    const [editingShop, setEditingShop] = useState<Shop | null>(null)
    const [showShopForm, setShowShopForm] = useState(false)
    const [shopForm, setShopForm] = useState({
        name: '',
        address: '',
        lat: '',
        lng: '',
        is_active: true
    })

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push('/login')
            return
        }
        if (!profile) return
        if (profile.role !== 'admin') {
            router.push('/')
            return
        }

        fetchProducts()
        fetchBusinessSettings()
        fetchShops()
    }, [user, profile, authLoading, router])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBusinessSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('business_settings')
                .select('*')
                .limit(1)
                .maybeSingle()

            if (error) {
                console.error('Error fetching business settings:', error)
                return
            }

            if (data) {
                setBusinessSettings(data)
                setSettingsForm({
                    business_name: data.business_name || '',
                    tagline: data.tagline || '',
                    description: data.description || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    address: data.address || '',
                    whatsapp: data.whatsapp || '',
                    facebook_url: data.facebook_url || '',
                    instagram_url: data.instagram_url || ''
                })
            } else {
                console.log('No business settings found. Please run the business_settings.sql migration.')
            }
        } catch (error) {
            console.error('Error fetching business settings:', error)
        }
    }

    const fetchShops = async () => {
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .order('name')

            if (error) throw error
            setShops(data || [])
        } catch (error) {
            console.error('Error fetching shops:', error)
        }
    }

    const handleShopSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingShop) {
                const { error } = await supabase
                    .from('shops')
                    .update(shopForm)
                    .eq('id', editingShop.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('shops')
                    .insert([shopForm])

                if (error) throw error
            }

            setShowShopForm(false)
            setEditingShop(null)
            setShopForm({
                name: '',
                address: '',
                lat: '',
                lng: '',
                is_active: true
            })
            fetchShops()
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const handleDeleteShop = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shop?')) return

        try {
            const { error } = await supabase
                .from('shops')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchShops()
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const productData = {
            name: formData.name,
            category: formData.category,
            price: formData.price,
            unit: formData.unit,
            image: formData.image,
            description: formData.description,
            options: optionsList.length > 0 ? optionsList : null,
            in_stock: formData.in_stock
        }

        try {
            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData])

                if (error) throw error
            }

            setShowForm(false)
            setEditingProduct(null)
            resetForm()
            fetchProducts()
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const handleSeedProducts = async () => {
        if (!confirm('This will clear existing products and add the default 4 products. Continue?')) return

        try {
            // 1. Clear existing
            const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
            if (deleteError) throw deleteError

            // 2. Insert defaults
            const defaultProducts = [
                {
                    name: "Ayam Segar (Broiler)",
                    category: "whole",
                    price: 11.00,
                    unit: "kg",
                    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800",
                    description: "Freshly slaughtered daily. Cleaned and ready to cook.",
                    options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
                    weight_options: [1.8, 2.2, 2.6],
                    in_stock: true
                },
                {
                    name: "Ayam Kampung Segar (Jantan)",
                    category: "whole",
                    price: 22.00,
                    unit: "kg",
                    image: "/ayam-kampung-jantan.jpg",
                    description: "Premium free-range chicken (Male). Firmer texture.",
                    options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
                    weight_options: [1.6, 2.0, 2.2],
                    in_stock: true
                },
                {
                    name: "Ayam Kampung Segar (Betina)",
                    category: "whole",
                    price: 20.00,
                    unit: "kg",
                    image: "/ayam-kampung-betina-v4.jpg",
                    description: "Fresh Kampung Chicken (Female).",
                    options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
                    weight_options: [1.6, 2.0, 2.2],
                    in_stock: true
                },
                {
                    name: "Ayam Tua Segar (Ayam Telor)",
                    category: "whole",
                    price: 18.00,
                    unit: "bird",
                    image: "/ayam-tua.jpg",
                    description: "Fresh Old Chicken (Layer Hen). Perfect for soup.",
                    options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
                    in_stock: true
                },
                {
                    name: "Ayam Kampung Dara (800-1.1kg)",
                    category: "whole",
                    price: 32.90,
                    unit: "set (2 birds)",
                    image: "/ayam-kampung-dara.png",
                    description: "Young free-range chicken. Sold in a set of 2 (approx 800g-1.1kg each).",
                    options: ["Whole", "Butterfly cut", "Cut 8", "Cut 12", "Cut 16", "Cincang(65)"],
                    in_stock: true
                }
            ]

            const { error: insertError } = await supabase.from('products').insert(defaultProducts)
            if (insertError) throw insertError

            alert('Products seeded successfully!')
            fetchProducts()
        } catch (error: any) {
            alert('Error seeding products: ' + error.message)
        }
    }

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const { error } = await supabase
                .from('business_settings')
                .update(settingsForm)
                .eq('id', businessSettings?.id)

            if (error) throw error

            alert('Business settings updated successfully!')
            fetchBusinessSettings()
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchProducts()
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'whole',
            price: 0,
            unit: 'kg',
            image: '',
            description: '',
            in_stock: true
        })
        setOptionsList([])
        setNewOption('')
    }

    const startEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            unit: product.unit,
            image: product.image,
            description: product.description || '',
            in_stock: product.in_stock
        })
        setOptionsList(product.options || [])
        setShowForm(true)
    }

    const addOption = () => {
        if (newOption.trim()) {
            setOptionsList([...optionsList, newOption.trim()])
            setNewOption('')
        }
    }

    const removeOption = (index: number) => {
        setOptionsList(optionsList.filter((_, i) => i !== index))
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-slate-600 mb-2">Loading Admin Dashboard...</div>
            </div>
        )
    }

    if (!user || !profile || profile.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Access Denied</h2>
                    <p className="text-slate-600 mb-6">You need admin privileges to access this page.</p>
                    <Button onClick={() => router.push('/')} className="rounded-full">Go to Home</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 font-bold rounded-t-xl transition-colors ${activeTab === 'products'
                            ? 'bg-white text-primary border-b-2 border-primary'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Package className="inline-block mr-2 h-5 w-5" />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 font-bold rounded-t-xl transition-colors ${activeTab === 'settings'
                            ? 'bg-white text-primary border-b-2 border-primary'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Settings className="inline-block mr-2 h-5 w-5" />
                        Business Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('shops')}
                        className={`px-6 py-3 font-bold rounded-t-xl transition-colors ${activeTab === 'shops'
                            ? 'bg-white text-primary border-b-2 border-primary'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Store className="inline-block mr-2 h-5 w-5" />
                        Shops
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-end mb-6 gap-3">
                            <Button onClick={handleSeedProducts} variant="secondary" className="rounded-full">
                                <Package className="mr-2 h-5 w-5" />
                                Seed Defaults
                            </Button>
                            <Button onClick={() => { setShowForm(!showForm); setEditingProduct(null); resetForm(); }} className="rounded-full">
                                <Plus className="mr-2 h-5 w-5" />
                                Add Product
                            </Button>
                        </div>

                        {showForm && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                                <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="whole">Whole Chicken</option>
                                            <option value="parts">Chicken Parts</option>
                                            <option value="eggs">Fresh Eggs</option>
                                            <option value="frozen">Frozen Goods</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Price (RM)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Product Options</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newOption}
                                                onChange={(e) => setNewOption(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                                placeholder="e.g. 12 cuts"
                                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            <Button type="button" onClick={addOption} className="rounded-full">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {optionsList.map((option, index) => (
                                                <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2">
                                                    <span className="text-sm font-medium">{option}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index)}
                                                        className="hover:bg-primary/20 rounded-full p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.in_stock}
                                            onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label className="text-sm font-bold text-slate-700">In Stock</label>
                                    </div>
                                    <div className="md:col-span-2 flex gap-4">
                                        <Button type="submit" className="rounded-full">
                                            {editingProduct ? 'Update' : 'Create'} Product
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} className="rounded-full">
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{product.name}</h3>
                                            <p className="text-sm text-slate-500">{product.category}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <p className="text-lg font-black text-primary mb-3">RM {product.price.toFixed(2)} / {product.unit}</p>
                                    {product.options && product.options.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-slate-600 mb-1">Options:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {product.options.map((opt, idx) => (
                                                    <span key={idx} className="text-xs bg-slate-100 px-2 py-1 rounded-full">{opt}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => startEdit(product)} className="flex-1 rounded-full">
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)} className="rounded-full text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && !showForm && (
                            <div className="text-center py-20">
                                <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">No products yet. Add your first product!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Business Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Store className="h-8 w-8 text-primary" />
                            <h2 className="text-2xl font-black text-slate-900">Business Profile</h2>
                        </div>

                        <form onSubmit={handleSettingsSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
                                    <input
                                        type="text"
                                        value={settingsForm.business_name}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, business_name: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tagline</label>
                                    <input
                                        type="text"
                                        value={settingsForm.tagline}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={settingsForm.description}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={settingsForm.phone}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        value={settingsForm.whatsapp}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={settingsForm.email}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        value={settingsForm.address}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                                    <input
                                        type="url"
                                        value={settingsForm.facebook_url}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Instagram URL</label>
                                    <input
                                        type="url"
                                        value={settingsForm.instagram_url}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="https://instagram.com/yourprofile"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" size="lg" className="rounded-full px-8">
                                    Save Business Settings
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Shops Tab */}
                {activeTab === 'shops' && (
                    <div>
                        <div className="flex justify-end mb-6 gap-3">
                            <Button onClick={() => {
                                setShowShopForm(!showShopForm);
                                setEditingShop(null);
                                setShopForm({ name: '', address: '', lat: '', lng: '', is_active: true });
                            }} className="rounded-full">
                                <Plus className="mr-2 h-5 w-5" />
                                Add Shop
                            </Button>
                        </div>

                        {showShopForm && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                                <h2 className="text-xl font-bold mb-4">{editingShop ? 'Edit Shop' : 'New Shop'}</h2>
                                <form onSubmit={handleShopSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Shop Name</label>
                                        <input
                                            type="text"
                                            value={shopForm.name}
                                            onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                            placeholder="e.g. SP_FCD_SHOP03 (Kota Kemuning)"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Address</label>
                                        <textarea
                                            value={shopForm.address}
                                            onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                            rows={2}
                                            placeholder="Full address for Lalamove pickup"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Latitude</label>
                                        <input
                                            type="text"
                                            value={shopForm.lat}
                                            onChange={(e) => setShopForm({ ...shopForm, lat: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                            placeholder="e.g. 3.0286"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Longitude</label>
                                        <input
                                            type="text"
                                            value={shopForm.lng}
                                            onChange={(e) => setShopForm({ ...shopForm, lng: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                            placeholder="e.g. 101.4892"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={shopForm.is_active}
                                            onChange={(e) => setShopForm({ ...shopForm, is_active: e.target.checked })}
                                            className="mr-2 h-4 w-4"
                                        />
                                        <label className="text-sm font-bold text-slate-700">Active Shop (Available for Pickup)</label>
                                    </div>
                                    <div className="md:col-span-2 flex gap-4 mt-2">
                                        <Button type="submit" className="rounded-full">
                                            {editingShop ? 'Update' : 'Create'} Shop
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => { setShowShopForm(false); setEditingShop(null); }} className="rounded-full">
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {shops.map((shop) => (
                                <div key={shop.id} className={`bg-white p-5 rounded-2xl shadow-sm border ${shop.is_active ? 'border-primary/20' : 'border-slate-100 bg-slate-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Store className={`h-5 w-5 ${shop.is_active ? 'text-primary' : 'text-slate-400'}`} />
                                            <h3 className={`font-bold ${shop.is_active ? 'text-slate-900' : 'text-slate-500'}`}>{shop.name}</h3>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingShop(shop)
                                                    setShopForm({
                                                        name: shop.name,
                                                        address: shop.address,
                                                        lat: shop.lat,
                                                        lng: shop.lng,
                                                        is_active: shop.is_active
                                                    })
                                                    setShowShopForm(true)
                                                }}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteShop(shop.id)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{shop.address}</p>
                                    <div className="flex gap-4 text-xs text-slate-400 font-mono">
                                        <span>Lat: {shop.lat}</span>
                                        <span>Lng: {shop.lng}</span>
                                    </div>
                                    {!shop.is_active && (
                                        <div className="mt-2 text-xs font-bold text-red-400 uppercase tracking-wider">Inactive</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {shops.length === 0 && !showShopForm && (
                            <div className="text-center py-20">
                                <Store className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">No shops configured yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
