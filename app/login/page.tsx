"use client"

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)

    // Form fields
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const { signIn, signUp } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            if (isSignUp) {
                if (!fullName.trim()) {
                    throw new Error('Please enter your full name')
                }
                if (!phone.trim()) {
                    throw new Error('Please enter your phone number')
                }
                await signUp(email, password, fullName, `+60${phone.replace(/^0/, '')}`)
                setMessage('Account created successfully!')
                setTimeout(() => router.push('/'), 1500)
            } else {
                await signIn(email, password)
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
                <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-slate-500 text-center mb-8">
                    {isSignUp ? 'Join SP Fresh Chicken' : 'Sign in to your account'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                                <div className="flex gap-2">
                                    <div className="w-20 p-3 bg-slate-100 border border-slate-200 rounded-xl text-center font-bold">
                                        +60
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="123456789"
                                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        maxLength={10}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Enter your mobile number (without leading 0)</p>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            required
                            minLength={6}
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                    </div>

                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-full font-bold"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : isSignUp ? (
                            <>
                                <UserPlus className="mr-2 h-5 w-5" />
                                Create Account
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-5 w-5" />
                                Sign In
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp)
                            setError('')
                            setMessage('')
                        }}
                        className="text-sm text-primary font-bold hover:underline"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
