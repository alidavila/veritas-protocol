import { Suspense, lazy } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { SEOHead } from './components/SEOHead'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/Login'
import { DashboardPage } from './pages/Dashboard'
import { AdminDashboardPage } from './pages/AdminDashboard'
import { useAuth } from './contexts/AuthContext'

// --- LAZY LOADED COMPONENTS ---
const VeritasHQ = lazy(() => import('./components/VeritasHQ').then(m => ({ default: m.VeritasHQ })))
const VeritasResendLanding = lazy(() => import('./components/VeritasResendLanding').then(m => ({ default: m.VeritasResendLanding })))

// Loading fallback
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-black text-emerald-500">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
)

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth()

    if (loading) return <LoadingFallback />
    if (!user) return <Navigate to="/login" replace />

    return children
}

function App() {
    // --- CRITICAL CONFIG CHECK ---
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 p-4 font-mono">
                <div className="max-w-md border border-red-900 bg-red-950/20 p-8 rounded-lg">
                    <h1 className="text-2xl font-bold mb-4">⚠️ Configuration Missing</h1>
                    <p className="mb-4 text-gray-300">
                        The <strong>Veritas Protocol</strong> cannot start because it's missing the connection to Supabase.
                    </p>
                    <div className="bg-black/50 p-4 rounded text-sm mb-6">
                        <p>Missing Variables:</p>
                        <ul className="list-disc list-inside mt-2 text-red-400">
                            {!import.meta.env.VITE_SUPABASE_URL && <li>VITE_SUPABASE_URL</li>}
                            {!import.meta.env.VITE_SUPABASE_ANON_KEY && <li>VITE_SUPABASE_ANON_KEY</li>}
                        </ul>
                    </div>
                    <p className="text-xs text-gray-500">
                        Administrator: Please add these in Vercel -> Settings -> Environment Variables.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <HelmetProvider>
            <SEOHead
                title="Veritas | The Protocol for Agents"
                description="Veritas enables autonomous economic agents with memory, identity, and payment capabilities."
            />

            <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<VeritasResendLanding />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* USER / OPERATOR VIEW */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* COMMANDER / ADMIN VIEW */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/hq" element={<VeritasHQ onExit={() => window.location.href = '/'} />} />

                        {/* Catch-all redirect to Home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </HelmetProvider>
    )
}

export default App
