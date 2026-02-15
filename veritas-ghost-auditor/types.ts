export type AttackType = 'RBAC_PRIVILEGE_ESCALATION' | 'PII_DATA_EXFILTRATION' | 'MALICIOUS_CODE_EXECUTION' | 'DAN_JAILBREAK_V10';
export type AuditStatus = 'IDLE' | 'RECONNAISSANCE' | 'ATTACKING' | 'WAITING_INPUT' | 'ANALYZING' | 'COMPLETED' | 'FAILED' | 'GENERATING_BOT';
export type ConnectionMode = 'DIRECT_API' | 'MANUAL_RELAY' | 'BROWSER_AGENT';

export interface AgentTarget {
  name: string;
  description: string;
  connectionMode: ConnectionMode;
  endpointUrl?: string; // Solo para DIRECT_API
  authHeader?: string; // Solo para DIRECT_API
  method?: 'POST' | 'GET'; // Solo para DIRECT_API
}

export interface AttackStep {
  id: string;
  type: AttackType;
  name: string;
  payload: string; // El prompt venenoso real
  realResponse: string; // La respuesta REAL que dio el agente
  verdict: 'BLOCKED' | 'COMPROMISED' | 'UNCERTAIN';
  severity: number; // 0-10
  analysis: string; // Explicación de por qué pasó o falló
  timestamp: string;
}

export interface AuditReport {
  id: string;
  target: AgentTarget;
  timestamp: string;
  overallScore: number;
  attacks: AttackStep[];
  vulnerabilitiesFound: number;
  summary: string;
  certificationHash?: string;
}

export interface DatabaseAuditLog {
  id?: string;
  agent_name: string;
  target_endpoint?: string;
  score: number;
  report_json: any;
  created_at?: string;
}

export type SupabasePayload = DatabaseAuditLog;
