
import { useState, useCallback, useEffect, useRef } from 'react'

export function useSpeech(lang: 'es' | 'en') {
    const [isEnabled, setIsEnabled] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const synth = useRef<SpeechSynthesis | null>(null)
    const mounted = useRef(true)

    useEffect(() => {
        synth.current = window.speechSynthesis
        return () => { mounted.current = false; cancel() }
    }, [])

    const speak = useCallback((text: string) => {
        if (!isEnabled || !synth.current) return

        // Cancel previous
        synth.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang === 'es' ? 'es-ES' : 'en-US'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        // Select a good voice if available
        const voices = synth.current.getVoices()
        // Try to find a Google voice or a natural sounding one
        const preferredVoice = voices.find(v =>
            v.lang.startsWith(lang === 'es' ? 'es' : 'en') &&
            (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural'))
        )

        if (preferredVoice) utterance.voice = preferredVoice

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        synth.current.speak(utterance)
    }, [isEnabled, lang])

    const cancel = useCallback(() => {
        if (synth.current) synth.current.cancel()
        setIsSpeaking(false)
    }, [])

    const toggle = useCallback(() => {
        setIsEnabled(prev => {
            if (prev) cancel() // Stop talking if we turn it off
            return !prev
        })
    }, [cancel])

    return { isEnabled, isSpeaking, speak, cancel, toggle }
}
