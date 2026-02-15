import { useState, useEffect } from 'react';

export function useBotDetection() {
    const [isBot, setIsBot] = useState(false);
    const [isFriendly, setIsFriendly] = useState(false);
    const [isScraper, setIsScraper] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();

        // 1. Definition of Friendly Bots (SEO)
        const friendlyBots = [
            'googlebot',
            'bingbot',
            'slurp',
            'duckduckbot',
            'baiduspider',
            'yandexbot',
            'facebot',
            'twitterbot',
            'pinterest',
            'linkedinbot',
            'whatsapp',
            'telegram',
            'discordbot'
        ];

        // 2. Definition of AI Scrapers (The Targets)
        const scrapers = [
            'gptbot',
            'ccbot',
            'anthropic-ai',
            'claude-web',
            'omgilibot',
            'facebook', // Meta AI
            'bytespider'
        ];

        const isFriendlyBot = friendlyBots.some(bot => ua.includes(bot));
        // Manual override for testing: ?bot=true
        const isManualBot = new URLSearchParams(window.location.search).get('bot') === 'true';
        const isScraperBot = scrapers.some(bot => ua.includes(bot)) || isManualBot;

        // General Bot Detection (simplistic)
        const isGenericBot = /bot|crawler|spider|crawling/i.test(ua);

        setIsBot(isFriendlyBot || isScraperBot || isGenericBot);
        setIsFriendly(isFriendlyBot);
        setIsScraper(isScraperBot || (isGenericBot && !isFriendlyBot));

        if (isScraperBot) {
            console.log("🚨 Scraper Detected:", ua);
        }

    }, []);

    return { isBot, isFriendly, isScraper };
}
