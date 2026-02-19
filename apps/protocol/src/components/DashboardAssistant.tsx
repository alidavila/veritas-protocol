import { useState, useRef, useEffect } from 'react'
import { Mic, Send, X, MessageCircle, Volume2 } from 'lucide-react'
import { askAssistant } from '../lib/claude'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface Props {
    metrics?: {
        totalEvents: number
        leadsFound: number
        alertsTriggered: number
        fundsAllocated: number
    }
    systemStatus?: 'running' | 'stopped'
    recentLogs?: any[]
    lang?: 'es' | 'en'
    isDark?: boolean
}

export function DashboardAssistant({ 
    metrics = { totalEvents: 0, leadsFound: 0, alertsTriggered: 0, fundsAllocated: 0 }, 
    systemStatus = 'stopped', 
    recentLogs = [], 
    lang = 'es', 
    isDark = true 
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    const recognitionRef = useRef<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const t = {
        es: {
            placeholder: 'Escribe o habla para preguntar...',
            thinking: 'Pensando...',
            listening: 'Escuchando...',
            welcome: 'Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?'
        },
        en: {
            placeholder: 'Type or speak to ask...',
            thinking: 'Thinking...',
            listening: 'Listening...',
            welcome: 'Hi! I\'m your virtual assistant. How can I help you?'
        }
    }[lang]

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = lang === 'es' ? 'es-ES' : 'en-US'

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                setIsRecording(false)
                handleSend(transcript)
            }

            recognitionRef.current.onerror = () => setIsRecording(false)
            recognitionRef.current.onend = () => setIsRecording(false)
        }
    }, [lang])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: t.welcome,
                timestamp: new Date()
            }])
        }
    }, [isOpen])

    const toggleRecording = () => {
        if (!recognitionRef.current) return
        if (isRecording) {
            recognitionRef.current.stop()
            setIsRecording(false)
        } else {
            recognitionRef.current.start()
            setIsRecording(true)
        }
    }

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = lang === 'es' ? 'es-ES' : 'en-US'
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleSend = async (text?: string) => {
        const message = text || input.trim()
        if (!message) return

        const userMessage: Message = { role: 'user', content: message, timestamp: new Date() }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await askAssistant(message, {
                totalEvents: metrics.totalEvents,
                leadsFound: metrics.leadsFound,
                alertsTriggered: metrics.alertsTriggered,
                fundsAllocated: metrics.fundsAllocated,
                systemStatus,
                recentLogs
            }, lang)

            const assistantMessage: Message = { role: 'assistant', content: response, timestamp: new Date() }
            setMessages(prev => [...prev, assistantMessage])
            speak(response)
        } catch (error) {
            console.error('Assistant error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const bg = isDark ? 'bg-zinc-900' : 'bg-white'
    const border = isDark ? 'border-emerald-900/30' : 'border-zinc-200'
    const textMain = isDark ? 'text-zinc-200' : 'text-zinc-800'
    const textSub = isDark ? 'text-zinc-500' : 'text-zinc-600'
    const userBubble = isDark ? 'bg-emerald-900/30 text-emerald-100' : 'bg-emerald-100 text-emerald-900'
    const assistantBubble = isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'

    return (
        <div className={`w-full h-full flex flex-col overflow-hidden ${bg}`}>
            <div className={`flex items-center justify-between p-4 border-b ${border}`}>
                <div className="flex items-center gap-2">
                    <MessageCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`font-bold ${textMain}`}>CEO Assistant (Claude)</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? userBubble : assistantBubble}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className={`p-3 rounded-lg text-sm ${assistantBubble} self-start`}>{t.thinking}</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className={`p-4 border-t ${border}`}>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isRecording ? t.listening : t.placeholder}
                        disabled={isRecording || isLoading}
                        className={`flex-1 px-3 py-2 rounded border text-sm ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    <button onClick={toggleRecording} className={`p-2 rounded transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        <Mic className="w-4 h-4 text-white" />
                    </button>
                    <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="p-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}
