/**
 * PAYFLEX SYSTEMS - TENANT RESOLVER
 * Gets tenant by subdomain or ID
 */

export async function getTenantBySubdomain(subdomain: string, supabase: any) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*, tenant_settings(*)')
    .eq('subdomain', subdomain)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }

  return data;
}

export async function getTenantById(tenantId: string, supabase: any) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*, tenant_settings(*)')
    .eq('id', tenantId)
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }

  return data;
}

export async function getUserTenants(userId: string, supabase: any) {
  const { data, error } = await supabase
    .from('tenant_users')
    .select('tenant_id, role, tenants(*)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user tenants:', error);
    return [];
  }

  return data;
}
