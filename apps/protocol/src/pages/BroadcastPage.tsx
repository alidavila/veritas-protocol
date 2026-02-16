import { Helmet } from 'react-helmet-async'
import {
    LayoutGrid, Video, FileText, Share2, Plus,
    Calendar, CheckCircle2, Clock, MoreVertical,
    Youtube, Linkedin, Mic, Sparkles
} from 'lucide-react'
import { useState } from 'react'

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
    status: 'IDEA' | 'SCRIPTING' | 'RECORDING' | 'EDITING' | 'PUBLISHED'
    format: 'VIDEO' | 'POST' | 'THREAD'
    channels: ('YOUTUBE' | 'LINKEDIN')[]
    date?: string
}

const MOCK_CONTENT: ContentItem[] = [
    { id: '1', title: 'Genesis: Creating the First AI Wallet', status: 'SCRIPTING', format: 'VIDEO', channels: ['YOUTUBE', 'LINKEDIN'], date: 'Feb 17' },
    { id: '2', title: 'Why AI Agents Need Bank Accounts', status: 'IDEA', format: 'POST', channels: ['LINKEDIN'] },
    { id: '3', title: 'How I Built a CEO Dashboard in 2 Hours', status: 'PUBLISHED', format: 'VIDEO', channels: ['YOUTUBE'], date: 'Feb 14' },
]

export function BroadcastPage() {
    const [view, setView] = useState<'KANBAN' | 'LIST'>('KANBAN')

    return (
        <div className={`min-h-screen ${THEME.bg} text-white font-sans flex`}>
            <Helmet>
                <title>Broadcast Hub | Veritas</title>
            </Helmet>

            {/* Main Content Area - Full Width */}
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black p-8">
                
                {/* Header */}
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Broadcast Hub</h1>
                        <p className="text-zinc-500">Central command for your personal brand machinery.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors text-sm">
                            <LayoutGrid className="w-4 h-4" /> View
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm font-medium shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]">
                            <Plus className="w-4 h-4" /> New Content
                        </button>
                    </div>
                </header>

                {/* Workflow Canvas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto pb-8">
                    
                    {/* Column: IDEAS */}
                    <div className="flex flex-col gap-4 min-w-[280px]">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                                Ideas
                            </span>
                            <span className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full">3</span>
                        </div>
                        
                        {/* Idea Card */}
                        <div className={`${THEME.panel} p-4 rounded-xl group hover:border-zinc-600 transition-all cursor-pointer`}>
                            <h3 className="font-medium text-sm mb-3 text-zinc-200">AI Agents vs. Employees: The Cost Analysis</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-black flex items-center justify-center">
                                        <Linkedin className="w-3 h-3 text-blue-500" />
                                    </div>
                                </div>
                                <span className="text-[10px] text-zinc-600 font-mono">#thought-leadership</span>
                            </div>
                        </div>
                        
                        {/* New Idea Input */}
                        <button className="w-full p-3 rounded-xl border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-sm flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Quick Draft
                        </button>
                    </div>

                    {/* Column: SCRIPTING */}
                    <div className="flex flex-col gap-4 min-w-[280px]">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-3 h-3 text-blue-500" />
                                Scripting
                            </span>
                            <span className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full">1</span>
                        </div>

                        {/* Active Script Card */}
                        <div className={`${THEME.panel} p-4 rounded-xl group hover:border-blue-500/30 transition-all cursor-pointer border-l-2 border-l-blue-500`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">IN PROGRESS</span>
                                <MoreVertical className="w-4 h-4 text-zinc-600 hover:text-zinc-300" />
                            </div>
                            <h3 className="font-bold text-base mb-3 text-white">Genesis: Creating the First AI Wallet</h3>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4">
                                <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Voiceover</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5m</span>
                            </div>
                            <div className="pt-3 border-t border-zinc-900 flex justify-between items-center">
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 rounded bg-red-600/20 flex items-center justify-center">
                                        <Youtube className="w-3 h-3 text-red-500" />
                                    </div>
                                    <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                        <Linkedin className="w-3 h-3 text-blue-500" />
                                    </div>
                                </div>
                                <button className="text-xs text-blue-500 hover:underline">Open Editor →</button>
                            </div>
                        </div>
                    </div>

                    {/* Column: RECORDING */}
                    <div className="flex flex-col gap-4 min-w-[280px]">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Video className="w-3 h-3 text-red-500" />
                                Recording
                            </span>
                            <span className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full">0</span>
                        </div>
                        <div className="h-24 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700 text-xs">
                            No active shoots
                        </div>
                    </div>

                    {/* Column: DISTRIBUTION */}
                    <div className="flex flex-col gap-4 min-w-[280px]">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Share2 className="w-3 h-3 text-purple-500" />
                                Distribution
                            </span>
                            <span className="text-xs bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full">0</span>
                        </div>
                        <div className="h-24 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-700 text-xs">
                            Queue empty
                        </div>
                    </div>

                    {/* Column: ANALYTICS */}
                    <div className="flex flex-col gap-4 min-w-[280px]">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Published
                            </span>
                        </div>

                        <div className={`${THEME.panel} p-4 rounded-xl opacity-60 hover:opacity-100 transition-opacity`}>
                            <h3 className="font-medium text-sm mb-2 text-zinc-300 line-through">How I Built a CEO Dashboard</h3>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-zinc-900 rounded p-2 text-center">
                                    <span className="block text-[10px] text-zinc-500 uppercase">Views</span>
                                    <span className="text-xs font-bold text-white">1.2k</span>
                                </div>
                                <div className="bg-zinc-900 rounded p-2 text-center">
                                    <span className="block text-[10px] text-zinc-500 uppercase">CTR</span>
                                    <span className="text-xs font-bold text-emerald-500">4.5%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
