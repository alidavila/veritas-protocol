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
