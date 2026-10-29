export type Role = 'admin' | 'guest';

// Tabs only some roles may open. A tab missing here is open to every signed-in account.
// The shell checks this before mounting a tab, so typing the URL (#/link-budget) is blocked too;
// the matching database rule (supabase/schema.sql) keeps guests out of the cloud scenarios.
const RESTRICTED: Record<string, readonly Role[]> = {
  'link-budget': ['admin'],
};

export function canOpen(role: Role, tab: string): boolean {
  return RESTRICTED[tab]?.includes(role) ?? true;
}
