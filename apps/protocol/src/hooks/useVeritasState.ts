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

export interface Signal {
    time: string;
    agent: string;
    log: string;
    cost: string;
}

export interface Stats {
    leads: number;
    emails: number;
    clicks: number;
    tolls: number;
    gatekeeperNodes: number;
}

export function useVeritasState() {
    const [ledger, setLedger] = useState<Transaction[]>([]);
    const [treasury, setTreasury] = useState(0);
    const [stats, setStats] = useState<Stats>({ leads: 0, emails: 0, clicks: 0, tolls: 0, gatekeeperNodes: 0 });
    const [signals, setSignals] = useState<Signal[]>([]);

    // Initial Fetch & Subscription
    useEffect(() => {
        fetchAll();

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
                    fetchStats(); // Update stats on new tx
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAll = () => {
        fetchLedger();
        fetchBalance();
        fetchStats();
    };

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
            // Build signals from ledger
            setSignals(data.slice(0, 10).map((row: any) => ({
                time: new Date(row.created_at).toLocaleTimeString(),
                agent: row.agent_id || 'system',
                log: row.action,
                cost: `${parseFloat(row.amount || 0).toFixed(6)} ETH`
            })));
        }
    };

    const fetchStats = async () => {
        try {
            // Count leads
            const { count: leadCount } = await supabase
                .from('agent_ledger')
                .select('*', { count: 'exact', head: true })
                .eq('action', 'LEAD_FOUND');

            // Count sent emails
            const { count: emailCount } = await supabase
                .from('agent_ledger')
                .select('*', { count: 'exact', head: true })
                .in('action', ['EMAIL_SENT', 'EMAIL_QUEUED']);

            // Count clicks/responses
            const { count: clickCount } = await supabase
                .from('agent_ledger')
                .select('*', { count: 'exact', head: true })
                .in('action', ['CLICK', 'RESPONSE', 'REPLY']);

            // Count x402 tolls
            const { count: tollCount } = await supabase
                .from('agent_ledger')
                .select('*', { count: 'exact', head: true })
                .in('action', ['TOLL_COLLECTED', 'PAYMENT_ACCEPTED']);

            // Count gatekeeper installations (agents with gatekeeper in name)
            const { count: gkCount } = await supabase
                .from('agents')
                .select('*', { count: 'exact', head: true });

            setStats({
                leads: leadCount || 0,
                emails: emailCount || 0,
                clicks: clickCount || 0,
                tolls: tollCount || 0,
                gatekeeperNodes: gkCount || 0
            });
        } catch (e) {
            console.error('Error fetching stats:', e);
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

    return { ledger, treasury, stats, signals, fetchStats };
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
