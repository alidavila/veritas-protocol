import { Helmet } from 'react-helmet-async'
import {
    LayoutGrid, Video, FileText, Share2, Plus,
    CheckCircle2,
    Youtube, Linkedin, Sparkles, X, Save
} from 'lucide-react'
import { useState, useEffect } from 'react'

const THEME = {
    bg: 'bg-black',
    panel: 'bg-zinc-950 border border-zinc-800',
    text: 'text-zinc-400',
    accent: 'text-purple-500', // Marketing uses Purple accent
    border: 'border-zinc-800'
}

type ContentItem = {
    id: string
    title: string
    status: 'IDEA' | 'SCRIPTING' | 'RECORDING' | 'DISTRIBUTION' | 'PUBLISHED'
    format: 'VIDEO' | 'POST' | 'THREAD'
    channels: ('YOUTUBE' | 'LINKEDIN')[]
    date?: string
    notes?: string
}

// Default items if storage is empty
const DEFAULT_ITEMS: ContentItem[] = [
    { id: '1', title: 'Genesis: Creating the First AI Wallet', status: 'SCRIPTING', format: 'VIDEO', channels: ['YOUTUBE', 'LINKEDIN'], date: 'Feb 17' },
    { id: '2', title: 'Why AI Agents Need Bank Accounts', status: 'IDEA', format: 'POST', channels: ['LINKEDIN'] },
]

export function BroadcastPage() {
    const [items, setItems] = useState<ContentItem[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newItemTitle, setNewItemTitle] = useState('')
    const [newItemFormat, setNewItemFormat] = useState<'VIDEO' | 'POST'>('VIDEO')

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('veritas_broadcast_items')
        if (saved) {
            setItems(JSON.parse(saved))
        } else {
            setItems(DEFAULT_ITEMS)
        }
    }, [])

    // Save to local storage on change
    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem('veritas_broadcast_items', JSON.stringify(items))
        }
    }, [items])

    const handleCreateItem = () => {
        if (!newItemTitle.trim()) return

        const newItem: ContentItem = {
            id: Date.now().toString(),
            title: newItemTitle,
            status: 'IDEA',
            format: newItemFormat,
            channels: newItemFormat === 'VIDEO' ? ['YOUTUBE'] : ['LINKEDIN'],
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }

        setItems([newItem, ...items])
        setNewItemTitle('')
        setIsModalOpen(false)
    }

    const moveItem = (id: string, newStatus: ContentItem['status']) => {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item))
    }

    const deleteItem = (id: string) => {
        if (confirm('Delete this content card?')) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const RenderColumn = ({ status, label, icon: Icon, count }: { status: ContentItem['status'], label: string, icon: any, count: number }) => (
        <div className="flex flex-col gap-4 min-w-[280px]">
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Icon className={`w-3 h-3 ${status === 'IDEA' ? 'text-yellow-500' : status === 'PUBLISHED' ? 'text-emerald-500' : 'text-blue-500'}`} />
                    {label}
                </span>
                <span className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full">{count}</span>
            </div>

            {/* Quick Draft Button for IDEA column */}
            {status === 'IDEA' && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full p-3 rounded-xl border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Quick Draft
                </button>
            )}

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {items.filter(i => i.status === status).map(item => (
                    <div key={item.id} className={`${THEME.panel} p-4 rounded-xl group hover:border-zinc-600 transition-all cursor-pointer relative`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                item.format === 'VIDEO' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                                {item.format}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded">
                                <X className="w-3 h-3 text-zinc-500" />
                            </button>
                        </div>
                        
                        <h3 className="font-bold text-sm mb-3 text-zinc-200 leading-snug">{item.title}</h3>
                        
                        <div className="pt-3 border-t border-zinc-900 flex justify-between items-center">
                            <div className="flex gap-2">
                                {item.channels.includes('YOUTUBE') && <Youtube className="w-3 h-3 text-red-500" />}
                                {item.channels.includes('LINKEDIN') && <Linkedin className="w-3 h-3 text-blue-500" />}
                            </div>
                            
                            {/* Simple Status Mover (Temporary until drag-n-drop) */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {status !== 'IDEA' && (
                                    <button onClick={() => moveItem(item.id, getPrevStatus(status))} className="text-[10px] bg-zinc-800 px-1.5 rounded hover:bg-zinc-700">←</button>
                                )}
                                {status !== 'PUBLISHED' && (
                                    <button onClick={() => moveItem(item.id, getNextStatus(status))} className="text-[10px] bg-zinc-800 px-1.5 rounded hover:bg-zinc-700">→</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {items.filter(i => i.status === status).length === 0 && status !== 'IDEA' && (
                    <div className="h-24 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700 text-xs">
                        Empty
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <div className={`min-h-screen ${THEME.bg} text-white font-sans flex`}>
            <Helmet>
                <title>Broadcast Hub | Veritas</title>
            </Helmet>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                New Idea
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-zinc-800 rounded-lg">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Title / Concept</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    placeholder="e.g., How AI Agents Will Replace Middle Management..."
                                    className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateItem()}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Format</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setNewItemFormat('VIDEO')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${newItemFormat === 'VIDEO' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        <Video className="w-4 h-4" /> Video
                                    </button>
                                    <button 
                                        onClick={() => setNewItemFormat('POST')}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${newItemFormat === 'POST' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        <FileText className="w-4 h-4" /> Post
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleCreateItem}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Save className="w-4 h-4" /> Save Idea
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black p-8">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Broadcast Hub</h1>
                        <p className="text-zinc-500">Central command for your personal brand machinery.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors text-sm">
                            <LayoutGrid className="w-4 h-4" /> View
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm font-medium shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]"
                        >
                            <Plus className="w-4 h-4" /> New Content
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto pb-8 min-h-[600px]">
                    <RenderColumn status="IDEA" label="Ideas" icon={Sparkles} count={items.filter(i => i.status === 'IDEA').length} />
                    <RenderColumn status="SCRIPTING" label="Scripting" icon={FileText} count={items.filter(i => i.status === 'SCRIPTING').length} />
                    <RenderColumn status="RECORDING" label="Recording" icon={Video} count={items.filter(i => i.status === 'RECORDING').length} />
                    <RenderColumn status="DISTRIBUTION" label="Distribution" icon={Share2} count={items.filter(i => i.status === 'DISTRIBUTION').length} />
                    <RenderColumn status="PUBLISHED" label="Published" icon={CheckCircle2} count={items.filter(i => i.status === 'PUBLISHED').length} />
                </div>
            </main>
        </div>
    )
}

function getNextStatus(current: ContentItem['status']): ContentItem['status'] {
    const flow: ContentItem['status'][] = ['IDEA', 'SCRIPTING', 'RECORDING', 'DISTRIBUTION', 'PUBLISHED']
    const idx = flow.indexOf(current)
    return idx < flow.length - 1 ? flow[idx + 1] : current
}

function getPrevStatus(current: ContentItem['status']): ContentItem['status'] {
    const flow: ContentItem['status'][] = ['IDEA', 'SCRIPTING', 'RECORDING', 'DISTRIBUTION', 'PUBLISHED']
    const idx = flow.indexOf(current)
    return idx > 0 ? flow[idx - 1] : current
}
