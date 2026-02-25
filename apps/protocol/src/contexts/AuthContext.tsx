
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    signInWithGoogle: () => Promise<void>
    signInWithMagicLink: (email: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signInWithPassword: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

// Support multiple admin emails (comma-separated in env)
const ADMIN_EMAILS = (import.meta as any).env?.VITE_ADMIN_EMAIL?.split(',').map((e: string) => e.trim().toLowerCase()) || []

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
    signInWithGoogle: async () => { },
    signInWithMagicLink: async () => { },
    signUp: async () => { },
    signInWithPassword: async () => { },
    signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for changes (handles magic link token processing)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)

            // Auto-redirect after magic link or OAuth callback
            if (event === 'SIGNED_IN' && session?.user) {
                const email = session.user.email?.toLowerCase() || ''
                const isAdminUser = ADMIN_EMAILS.includes(email)
                const target = isAdminUser ? '/dashboard' : '/dashboard'

                // Only redirect if we're on root or login page (magic link landed here)
                const currentPath = window.location.pathname
                if (currentPath === '/' || currentPath === '/login') {
                    window.location.href = target
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        })
        if (error) throw error
    }

    const signInWithMagicLink = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        })
        if (error) throw error
    }

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        })
        if (error) throw error
    }

    const signInWithPassword = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{
            user, session, loading, isAdmin,
            signInWithGoogle, signInWithMagicLink,
            signUp, signInWithPassword, signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}
