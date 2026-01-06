/**
 * PAYFLEX SYSTEMS - AUDIT LOGGER
 * Logs all system events for compliance and debugging
 */

interface AuditEvent {
  actor_id?: string;
  tenant_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: any;
  ip?: string;
  user_agent?: string;
}

export async function logEvent(supabase: any, event: AuditEvent) {
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      actor_id: event.actor_id,
      tenant_id: event.tenant_id,
      action: event.action,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      metadata: event.metadata || {},
      ip_address: event.ip,
      user_agent: event.user_agent
    }]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // Provider actions
  PROVIDER_CREATED: 'PROVIDER_CREATED',
  PROVIDER_UPDATED: 'PROVIDER_UPDATED',
  PROVIDER_APPROVED: 'PROVIDER_APPROVED',
  PROVIDER_REJECTED: 'PROVIDER_REJECTED',
  PROVIDER_STATUS_CHANGED: 'PROVIDER_STATUS_CHANGED',
  
  // Agreement actions
  AGREEMENT_SIGNED: 'AGREEMENT_SIGNED',
  AGREEMENT_GENERATED: 'AGREEMENT_GENERATED',
  
  // Document actions
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  
  // Tenant actions
  TENANT_CREATED: 'TENANT_CREATED',
  TENANT_UPDATED: 'TENANT_UPDATED',
  TENANT_SETTINGS_CHANGED: 'TENANT_SETTINGS_CHANGED',
  
  // Admin actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_ACTION: 'ADMIN_ACTION',
  
  // Search actions
  PROVIDER_SEARCHED: 'PROVIDER_SEARCHED',
  REFERRAL_CREATED: 'REFERRAL_CREATED'
};
