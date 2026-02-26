import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Job = {
  id: string;
  auth_user_id?: string | null;
  username: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  created_at: string;
};

export type NewJob = {
  auth_user_id?: string | null;
  username: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
};

export type Project = {
  id: string;
  auth_user_id?: string | null;
  username: string;
  name: string;
  description: string;
  tech_stack: string | null;
  live_url: string | null;
  github_url: string | null;
  image_url: string | null;
  is_pinned?: boolean | null;
  created_at: string;
};

export type NewProject = {
  auth_user_id?: string | null;
  username: string;
  name: string;
  description: string;
  tech_stack?: string | null;
  live_url?: string | null;
  github_url?: string | null;
  image_url?: string | null;
  is_pinned?: boolean | null;
};

export type UpdateProject = {
  name?: string;
  description?: string;
  tech_stack?: string | null;
  live_url?: string | null;
  github_url?: string | null;
  image_url?: string | null;
  is_pinned?: boolean | null;
};

export type ProfileSettings = {
  id: string;
  auth_user_id?: string | null;
  username: string;
  full_name: string | null;
  role_title: string | null;
  tagline: string | null;
  location: string | null;
  email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertProfileSettings = {
  auth_user_id?: string | null;
  username: string;
  full_name?: string | null;
  role_title?: string | null;
  tagline?: string | null;
  location?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
};

export type AppUser = {
  id: string;
  auth_user_id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertAppUser = {
  auth_user_id: string;
  username: string;
  email?: string | null;
  full_name?: string | null;
};

export type LocalUser = {
  id: string;
  username: string;
  full_name: string | null;
  password: string;
  created_at: string;
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

export async function getProfileSettings(username: string, authUserId?: string | null) {
  const byAuthQuery = authUserId
    ? await supabase
        .from('profile_settings')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle()
    : null;

  if (byAuthQuery && !byAuthQuery.error && byAuthQuery.data) {
    return byAuthQuery.data as ProfileSettings;
  }

  const { data, error } = await supabase
    .from('profile_settings')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ProfileSettings | null;
}

export async function upsertProfileSettings(input: UpsertProfileSettings) {
  const { data, error } = await supabase
    .from('profile_settings')
    .upsert(input, { onConflict: 'username' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileSettings;
}

export async function getAppUserByAuthId(authUserId: string) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AppUser | null;
}

export async function upsertAppUser(input: UpsertAppUser) {
  const { data, error } = await supabase
    .from('app_users')
    .upsert(input, { onConflict: 'auth_user_id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as AppUser;
}

export async function getLocalUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('local_users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LocalUser | null;
}

export async function createLocalUser(input: {
  username: string;
  full_name?: string | null;
  password: string;
}) {
  const { data, error } = await supabase
    .from('local_users')
    .insert({
      username: input.username,
      full_name: input.full_name ?? null,
      password: input.password,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as LocalUser;
}

export async function getJobs(username: string, authUserId?: string | null) {
  const byAuthQuery = authUserId
    ? await supabase
        .from('jobs')
        .select('*')
        .eq('auth_user_id', authUserId)
        .order('start_date', { ascending: false })
        .order('created_at', { ascending: false })
    : null;

  if (byAuthQuery && !byAuthQuery.error && (byAuthQuery.data?.length ?? 0) > 0) {
    return (byAuthQuery.data ?? []) as Job[];
  }

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

export async function getProjects(username: string, authUserId?: string | null) {
  const pinnedByAuthQuery = authUserId
    ? await supabase
        .from('projects')
        .select('*')
        .eq('auth_user_id', authUserId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
    : null;

  if (pinnedByAuthQuery && !pinnedByAuthQuery.error && (pinnedByAuthQuery.data?.length ?? 0) > 0) {
    return (pinnedByAuthQuery.data ?? []) as Project[];
  }

  const pinnedQuery = await supabase
    .from('projects')
    .select('*')
    .eq('username', username)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (!pinnedQuery.error) {
    return (pinnedQuery.data ?? []) as Project[];
  }

  const shouldFallbackToLegacyOrder = pinnedQuery.error.message
    .toLowerCase()
    .includes('is_pinned');

  if (!shouldFallbackToLegacyOrder) {
    throw pinnedQuery.error;
  }

  const legacyQuery = await supabase
    .from('projects')
    .select('*')
    .eq('username', username)
    .order('created_at', { ascending: false });

  if (legacyQuery.error) {
    throw legacyQuery.error;
  }

  return (legacyQuery.data ?? []) as Project[];
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

export async function updateProject(projectId: string, updates: UpdateProject) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Project;
}



export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  created_at: string;
};

export async function getProjectById(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle(); // returns null instead of throwing if not found

  if (error) {
    throw error;
  }

  // data can be null if no row with that id
  return data as Project | null;
}

export async function getProjectImages(projectId: string) {
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProjectImage[];
}

export async function addProjectImages(projectId: string, imageUrls: string[]) {
  if (!imageUrls.length) return;

  const rows = imageUrls.map((url) => ({
    project_id: projectId,
    image_url: url,
  }));

  const { error } = await supabase
    .from('project_images')
    .insert(rows);

  if (error) {
    throw error;
  }
}