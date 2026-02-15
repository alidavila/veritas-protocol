// SERVICIO DE SUPABASE - CONECTADO
import { createClient } from '@supabase/supabase-js';
import { DatabaseAuditLog } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[SUPABASE] ⚠️ Credenciales no encontradas. Modo offline.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const saveAuditToDb = async (log: DatabaseAuditLog): Promise<boolean> => {
  if (!supabase) {
    console.warn('[SUPABASE] No conectado. El log no se guardó.');
    return false;
  }

  console.log('[SUPABASE] Guardando log de auditoría...');

  const { error } = await supabase.from('agent_ledger').insert([{
    agent_id: 'did:veritas:ghost:auditor',
    action: 'GHOST_AUDIT_COMPLETED',
    amount: 0,
    details: {
      target_name: log.targetName,
      target_url: log.targetUrl,
      overall_score: log.overallScore,
      vulnerabilities_found: log.vulnerabilitiesFound,
      certification_hash: log.certificationHash,
      attack_count: log.attackCount,
      timestamp: log.timestamp,
      source: 'GHOST_AUDITOR_UI'
    }
  }]);

  if (error) {
    console.error('[SUPABASE] Error guardando:', error.message);
    return false;
  }

  console.log('[SUPABASE] ✅ Auditoría guardada en agent_ledger');
  return true;
};

export const fetchAuditHistory = async (): Promise<any[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('agent_ledger')
    .select('*')
    .eq('action', 'GHOST_AUDIT_COMPLETED')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[SUPABASE] Error leyendo historial:', error.message);
    return [];
  }

  return data || [];
};
