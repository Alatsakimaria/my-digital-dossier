import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Job = {
  id: string;
  username: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  created_at: string;
};

export type NewJob = {
  username: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
};

export type Project = {
  id: string;
  username: string;
  name: string;
  description: string;
  tech_stack: string | null;
  live_url: string | null;
  github_url: string | null;
  image_url: string | null;
  created_at: string;
};

export type NewProject = {
  username: string;
  name: string;
  description: string;
  tech_stack?: string | null;
  live_url?: string | null;
  github_url?: string | null;
  image_url?: string | null;
};

export async function getLatestCV() {
  // 1. Get the list of files in the 'cvs' folder, sorted by newest
  const { data, error } = await supabase.storage
    .from('dossier-files')
    .list('cvs', {
      limit: 1,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error || !data || data.length === 0) return null;

  // 2. Generate the public link for that specific file
  const { data: urlData } = supabase.storage
    .from('dossier-files')
    .getPublicUrl(`cvs/${data[0].name}`);

  return urlData.publicUrl;
}

export async function getJobs(username: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('username', username)
    .order('start_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Job[];
}

export async function createJob(job: NewJob) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Job;
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    throw error;
  }
}

export async function getProjects(username: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('username', username)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Project[];
}

export async function createProject(project: NewProject) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Project;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    throw error;
  }
}