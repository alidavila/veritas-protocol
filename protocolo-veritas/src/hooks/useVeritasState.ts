import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

// Core Wallet Address (The Vault)
const TREASURY_ADDRESS = "0x4d2B70d358C5DA9c4fC6e8Ce743Ed67d55C19099";

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
});

export interface Transaction {
    id: string;
    from: string;
    to: string;
    amount: number;
    fee: number;
    timestamp: number;
    note: string;
}

export function useVeritasState() {
    const [ledger, setLedger] = useState<Transaction[]>([]);
    const [treasury, setTreasury] = useState(0);

    // Initial Fetch & Subscription
    useEffect(() => {
        fetchLedger();
        fetchBalance();

        // Realtime Subscription
        const channel = supabase
            .channel('agent_ledger_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'agent_ledger' },
                (payload) => {
                    const newTx = mapSupabaseToTx(payload.new);
                    setLedger(prev => [newTx, ...prev]);
                    fetchBalance(); // Update balance on new tx
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchLedger = async () => {
        const { data, error } = await supabase
            .from('agent_ledger')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) console.error('Error fetching ledger:', error);
        if (data) {
            console.log(`[useVeritasState] Fetched ${data.length} transactions from Supabase`);
            setLedger(data.map(mapSupabaseToTx));
        }
    };

    const fetchBalance = async () => {
        try {
            // 1. Get Treasurer Address from DB
            const { data: treasurer } = await supabase
                .from('agents')
                .select('wallet_address')
                .eq('id', 'did:veritas:treasurer:001')
                .single();

            const targetAddress = treasurer?.wallet_address || TREASURY_ADDRESS;

            // 2. Fetch Balance from Chain (Base Sepolia)
            if (targetAddress) {
                const balanceWei = await publicClient.getBalance({ address: targetAddress as `0x${string}` });
                setTreasury(parseFloat(formatEther(balanceWei)));
            }
        } catch (e) {
            console.error("Failed to fetch balance:", e);
        }
    };

    return { ledger, treasury };
}

function mapSupabaseToTx(row: any): Transaction {
    // Map Supabase 'agent_ledger' schema to dashboard 'Transaction' schema
    // agent_ledger: id, agent_id, action, amount, details, created_at
    // details might contain: message, to, from
    const details = row.details || {};
    return {
        id: row.id,
        from: row.agent_id || 'Unknown',
        to: details.to || 'Veritas Core',
        amount: parseFloat(row.amount || 0),
        fee: 0, // We can simulate fee
        timestamp: new Date(row.created_at).getTime(),
        note: row.action + (details.message ? `: ${details.message}` : '') + (details.reason ? `: ${details.reason}` : '') + (details.recipient ? ` -> ${details.recipient}` : '')
    };
}
