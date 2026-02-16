
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, User, Loader2 } from 'lucide-react'

interface CreateIdentityFormProps {
    onIdentityCreated: (name?: string) => void
}

export function CreateIdentityForm({ onIdentityCreated }: CreateIdentityFormProps) {
    const [name, setName] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            // Insert data into veritas_identities table
            const { error: insertError } = await supabase
                .from('veritas_identities')
                .insert([
                    {
                        agent_name: name,                // Mapeo: name (form) -> agent_name (db)
                        did_key: walletAddress || null,  // Mapeo: wallet (form) -> did_key (db)
                        owner_email: 'anon@veritas.protocol', // Valor por defecto requerido si no hay auth
                        spending_limit_usd: 0            // Valor inicial
                    }
                ])

            if (insertError) throw insertError

            setSuccess(true)

            // Guardamos el nombre actual antes de limpiar
            const createdName = name

            setName('')
            setWalletAddress('')

            // Notificamos al padre con el nombre para personalizar el siguiente paso
            if (onIdentityCreated) onIdentityCreated(createdName)

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)

        } catch (err: any) {
            console.error('Error creating identity:', err)
            setError(err.message || 'Error al crear la identidad')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <User className="w-4 h-4 text-white" />
                    Register New Agent
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
                        Agent Designation
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors text-sm"
                            placeholder="e.g. Alpha-1"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="wallet" className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2">
                        Wallet Address / DID (Optional)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="wallet"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-0 transition-colors font-mono text-sm"
                            placeholder="0x..."
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-400 text-xs bg-red-900/10 p-3 rounded border border-red-900/20 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="text-emerald-400 text-xs bg-emerald-900/10 p-3 rounded border border-emerald-900/20 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                        Identity Registered Successfully
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            Register Identity
                        </>
                    )}
                </button>
            </form>
        </section>
    )
}
