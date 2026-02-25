import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LANGUAGES = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
]

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' | 'navbar' }) {
    const { i18n } = useTranslation()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const switchLanguage = (code: string) => {
        i18n.changeLanguage(code)
        setOpen(false)
    }

    if (variant === 'compact') {
        return (
            <div ref={ref} className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Language / Idioma"
                >
                    <Globe className="w-5 h-5" />
                </button>
                {open && (
                    <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px] animate-in slide-in-from-top-2">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors ${lang.code === i18n.language ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-300'
                                    }`}
                            >
                                <span className="text-base">{lang.flag}</span>
                                <span>{lang.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Default / Navbar variant
    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm"
            >
                <span className="text-base">{currentLang.flag}</span>
                <span className="hidden sm:inline font-medium">{currentLang.label}</span>
                <Globe className="w-3.5 h-3.5" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[160px] animate-in slide-in-from-top-2">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-zinc-800 transition-colors ${lang.code === i18n.language ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-300'
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium">{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
