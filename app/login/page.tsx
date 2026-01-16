"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogIn, UserPlus, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react'

function LoginContent() {
    const [isSignUp, setIsSignUp] = useState(false)

    // Form fields
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')

    const [showPassword, setShowPassword] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const { signIn, signUp, forgotPassword } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect')

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)
        try {
            await forgotPassword(forgotPasswordEmail)
            setMessage('Password reset link sent to your email!')
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isForgotPassword) {
            handleForgotPassword(e)
            return
        }

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
                setTimeout(() => router.push(redirectPath || '/'), 1500)
            } else {
                await signIn(email, password)
                router.push(redirectPath || '/')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGuest = () => {
        localStorage.setItem('guestMode', 'true')
        router.push(redirectPath || '/shop')
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

                    {isForgotPassword ? (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Registration Email</label>
                            <input
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                required
                                placeholder="your@email.com"
                            />
                        </div>
                    ) : (
                        <>
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700">Password</label>
                                    {!isSignUp && (
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-xs text-primary font-bold hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 pr-12"
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {isSignUp && <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>}
                            </div>
                        </>
                    )}

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
                        {loading ? 'Please wait...' : isForgotPassword ? (
                            <>
                                <Mail className="mr-2 h-5 w-5" />
                                Send Reset Link
                            </>
                        ) : isSignUp ? (
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
                            if (isForgotPassword) {
                                setIsForgotPassword(false)
                            } else {
                                setIsSignUp(!isSignUp)
                            }
                            setError('')
                            setMessage('')
                        }}
                        className="text-sm text-primary font-bold hover:underline"
                    >
                        {isForgotPassword ? 'Back to Login' : isSignUp ? 'Already have an account? Sign In' : "New to SP Fresh Chicken Delivery? Create a free account"}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
                        ← Back to Home
                    </Link>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500 font-bold tracking-wider">
                            Or continue without account
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full rounded-full font-bold border-2 hover:bg-slate-50 hover:text-primary transition-colors"
                        onClick={handleGuest}
                    >
                        Continue as Guest
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-slate-400 mt-3 px-4 leading-relaxed">
                        You can still place orders without an email. We'll ask for your delivery details at checkout.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
