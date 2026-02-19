import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
    dangerouslyAllowBrowser: true // Note: In production, proxy this via backend
})

export async function askAssistant(
    question: string, 
    context: any,
    lang: 'es' | 'en' = 'es'
) {
    const systemPrompt = `You are Veritas, an advanced AI CEO Assistant.
    Current System Status: ${JSON.stringify(context, null, 2)}
    
    Role:
    - You manage a fleet of AI agents.
    - You are precise, strategic, and concise.
    - You speak ${lang === 'es' ? 'Spanish' : 'English'}.
    
    Goal: Answer the user's question about the fleet, metrics, or strategy.`

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
            { role: "user", content: question }
        ]
    })

    return msg.content[0].type === 'text' ? msg.content[0].text : "Error processing response."
}
