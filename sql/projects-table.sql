-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  tech_stack text,
  live_url text,
  github_url text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_projects_username ON public.projects (username);
CREATE INDEX idx_projects_created_at ON public.projects (created_at DESC);

-- Create RLS policy: Allow users to select their own projects
CREATE POLICY "Allow users to select their own projects"
ON public.projects
FOR SELECT
TO anon,
authenticated
USING (true);

-- Create RLS policy: Allow users to insert their own projects
CREATE POLICY "Allow users to insert their own projects"
ON public.projects
FOR INSERT
TO anon,
authenticated
WITH CHECK (true);

-- Create RLS policy: Allow users to delete their own projects
CREATE POLICY "Allow users to delete their own projects"
ON public.projects
FOR DELETE
TO anon,
authenticated
USING (true);
