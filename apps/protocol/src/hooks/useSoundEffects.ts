
import { useRef, useCallback } from 'react'

export function useSoundEffects() {
    // We use a ref to store the context to avoid re-creating it
    const audioContextRef = useRef<AudioContext | null>(null)

    // Initialize on first user interaction if needed (though we can try upfront)
    const getContext = useCallback(() => {
        if (!audioContextRef.current) {
            // @ts-ignore - Handle webkit prefix if needed
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass()
            }
        }
        return audioContextRef.current
    }, [])

    const playHover = useCallback(() => {
        const ctx = getContext()
        if (!ctx) return

        // Resume if suspended (common browser policy)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { })
        }

        // --- SUBTLE HIGH-TECH "TICK" ---
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        // High frequency sine wave for "crystal" sound
        osc.type = 'sine'

        // Randomize pitch slightly for organic feel (ASMR-like variety)
        const baseFreq = 800
        const randomDetune = Math.random() * 200 - 100 // +/- 100hz variance
        osc.frequency.setValueAtTime(baseFreq + randomDetune, ctx.currentTime)

        // Extremely short envelope (percussive)
        osc.connect(gain)
        gain.connect(ctx.destination)

        // Volume: Start very low, decay instantly
        gain.gain.setValueAtTime(0.02, ctx.currentTime) // Very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05) // 50ms decay

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.05)

    }, [getContext])

    const playClick = useCallback(() => {
        const ctx = getContext()
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume().catch(() => { })

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(400, ctx.currentTime)

        osc.connect(gain)
        gain.connect(ctx.destination)

        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.1)
    }, [getContext])

    const playScrollTick = useCallback(() => {
        const ctx = getContext()
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume().catch(() => { })

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        // Low frequency "thud/tick" for scroll feeling
        osc.type = 'sine'
        // Random pitch between 100-150Hz for texture
        const baseFreq = 120
        const randomDetune = Math.random() * 50
        osc.frequency.setValueAtTime(baseFreq + randomDetune, ctx.currentTime)

        osc.connect(gain)
        gain.connect(ctx.destination)

        // Very quiet
        gain.gain.setValueAtTime(0.02, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.03)
    }, [getContext])

    return { playHover, playClick, playScrollTick }
}
