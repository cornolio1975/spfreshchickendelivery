"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    profile: any | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>
    signOut: () => Promise<void>
    forgotPassword: (email: string) => Promise<void>
    updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. IMPROVED REDIRECT: Catch password recovery immediately
        // Redirecting before getSession/onAuthStateChange ensures we don't lose the token
        if (typeof window !== 'undefined' &&
            window.location.hash.includes('type=recovery') &&
            window.location.pathname !== '/reset-password') {
            console.log('Recovery token detected, forcing redirect to /reset-password')
            window.location.replace('/reset-password' + window.location.hash)
            return
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Session check error:', error)
                // Force clear local storage if token is invalid
                if (error.message?.includes('Refresh Token Not Found') || error.message?.includes('Invalid Refresh Token')) {
                    console.warn('Corrupt session detected, clearing data...')
                    localStorage.removeItem('supabase.auth.token') // Manual clear just in case
                    supabase.auth.signOut()
                }
                setUser(null)
                setLoading(false)
                return
            }
            setUser(session?.user ?? null)

            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event)

            if (event === 'PASSWORD_RECOVERY') {
                if (window.location.pathname !== '/reset-password') {
                    window.location.assign('/reset-password' + window.location.hash)
                }
                return
            }

            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId: string) => {
        if (!userId) {
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                // PGRST116 means "no rows found" - this is expected for new users
                // before the database trigger completes or if it fails.
                if (error.code === 'PGRST116') {
                    console.log('No profile found for user:', userId)
                    setProfile(null)
                    return
                }
                throw error
            }
            setProfile(data)
        } catch (error: any) {
            console.error('Error fetching profile:', error?.message || error)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
    }

    const signUp = async (email: string, password: string, fullName: string, phone: string) => {
        try {
            // Sign up with metadata
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    }
                }
            })

            if (error) throw error

            // Update profile with additional info (trigger will create basic profile)
            if (data.user) {
                // Wait a bit for trigger to complete
                await new Promise(resolve => setTimeout(resolve, 1000))

                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        phone: phone
                    })
                    .eq('id', data.user.id)

                if (profileError) {
                    console.error('Profile update error:', profileError)
                }
            }
        } catch (error) {
            console.error('Signup error:', error)
            throw error
        }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const forgotPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
    }

    const updatePassword = async (password: string) => {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, forgotPassword, updatePassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
