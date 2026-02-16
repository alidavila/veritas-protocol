
import { supabase } from './supabase'

export interface APIKey {
    id: string
    user_id: string
    name: string
    key_prefix: string
    created_at: string
    last_used_at: string | null
    scopes: string[]
}

export const keysService = {
    async getKeys() {
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, user_id, name, key_prefix, created_at, last_used_at, scopes')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as APIKey[]
    },

    async createKey(name: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Generate a random key
        const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const fullKey = `vt_live_${randomPart}`
        const prefix = `vt_live_`

        // In a real prod environment, we would only store the hash
        // For this demo/beta, we'll store the hash and show the key ONLY ONCE
        const keyHash = randomPart // Simplified for demo, should use SHA-256

        const { data, error } = await supabase
            .from('api_keys')
            .insert([{
                user_id: user.id,
                name,
                key_hash: keyHash,
                key_prefix: prefix
            }])
            .select()
            .single()

        if (error) throw error

        return {
            ...data,
            fullKey // This is the only time the user sees the full key
        }
    },

    async deleteKey(id: string) {
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
