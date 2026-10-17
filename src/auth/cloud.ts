import { supabase } from './supabase';
import type { ScenarioFile } from '../store/store';

export interface CloudScenario { id: string; name: string; updated_at: string }

// Row Level Security restricts every query to the signed-in user's own rows, so no
// user_id filter is needed here (and none could widen access if it were tampered with).

export async function listScenarios(): Promise<CloudScenario[]> {
  const { data, error } = await supabase.from('scenarios').select('id, name, updated_at').order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** Insert a new scenario, or overwrite `id` if given. Returns the row id. */
export async function saveScenario(name: string, file: ScenarioFile, id?: string): Promise<string> {
  const row = { name, data: file };
  const q = id
    ? supabase.from('scenarios').update(row).eq('id', id).select('id').single()
    : supabase.from('scenarios').insert(row).select('id').single();
  const { data, error } = await q;
  if (error) throw error;
  return data.id as string;
}

export async function loadScenario(id: string): Promise<ScenarioFile> {
  const { data, error } = await supabase.from('scenarios').select('data').eq('id', id).single();
  if (error) throw error;
  return data.data as ScenarioFile;
}

export async function deleteScenario(id: string): Promise<void> {
  const { error } = await supabase.from('scenarios').delete().eq('id', id);
  if (error) throw error;
}
