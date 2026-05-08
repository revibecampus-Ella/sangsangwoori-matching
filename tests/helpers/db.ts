import { createClient } from '@supabase/supabase-js';

// NEXT_PUBLIC_ 키는 브라우저에 공개되는 anon 키입니다
const supabase = createClient(
  'https://pxszsmqsitnxfveszroc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c3pzbXFzaXRueGZ2ZXN6cm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODcxNjYsImV4cCI6MjA5MzU2MzE2Nn0.87M4PdOK2L8LtOTID4HkQ4tltT393RFhhgHRYLrWZ9w'
);

/** matches → seniors → jobs 순으로 전체 삭제 */
export async function resetDB() {
  const { error: e1 } = await supabase.from('matches').delete().not('senior_id', 'is', null);
  if (e1) throw new Error(`matches 삭제 실패: ${e1.message}`);

  const { error: e2 } = await supabase.from('seniors').delete().not('name', 'is', null);
  if (e2) throw new Error(`seniors 삭제 실패: ${e2.message}`);

  const { error: e3 } = await supabase.from('jobs').delete().not('title', 'is', null);
  if (e3) throw new Error(`jobs 삭제 실패: ${e3.message}`);
}

export async function insertJob(job: {
  title: string;
  region: string;
  job_type: string;
  required_career: number;
}): Promise<string> {
  const { data, error } = await supabase.from('jobs').insert(job).select('id').single();
  if (error) throw new Error(`insertJob 실패: ${error.message}`);
  return data.id as string;
}

export async function getLatestSeniorId(): Promise<string> {
  const { data, error } = await supabase
    .from('seniors')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(`getLatestSeniorId 실패: ${error.message}`);
  return data.id as string;
}

export async function getSeniorsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('seniors')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`getSeniorsCount 실패: ${error.message}`);
  return count ?? 0;
}
