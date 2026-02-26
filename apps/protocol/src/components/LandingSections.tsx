import { useRef, useState } from 'react'
import { Zap, Shield, ArrowDown, Activity, Lock, Download, Globe, Terminal, Copy, Check, CheckCircle, PlayCircle, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useBotDetection } from '../hooks/useBotDetection'

export function LandingSections({ theme, lang = 'es' }: { theme: 'dark' | 'light', lang?: 'es' | 'en' }) {
    const [copied, setCopied] = useState(false)
    const [showWpTutorial, setShowWpTutorial] = useState(false)
    const isDark = theme === 'dark'
