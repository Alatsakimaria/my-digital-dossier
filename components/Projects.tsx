'use client';

import { useCallback, useEffect, useState } from 'react';
import { Code2, Github, ExternalLink, Plus, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { createProject, deleteProject, getProjects, type Project } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type ProjectsProps = {
  username: string;
};

type ProjectImage = {
  name: string;
  url: string;
  path: string;
};

export default function Projects({ username }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [projectImage, setProjectImage] = useState<ProjectImage | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getProjects(username);
      setProjects(data);
      setIsFormOpen(data.length === 0);
    } catch {
      setError('Could not load projects right now.');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const clearForm = () => {
    setName('');
    setDescription('');
    setTechStack('');
    setLiveUrl('');
    setGithubUrl('');
    setProjectImage(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      // Delete old image if exists
      if (projectImage?.path) {
        await supabase.storage.from('dossier-files').remove([projectImage.path]);
      }

      const fileName = `projects/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('dossier-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('dossier-files').getPublicUrl(fileName);

      setProjectImage({
        name: file.name,
        url: publicUrl,
        path: fileName,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('Image upload failed:', message);
      setError(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !description) {
      setError('Project name and description are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createProject({
        username,
        name,
        description,
        tech_stack: techStack || null,
        live_url: liveUrl || null,
        github_url: githubUrl || null,
        image_url: projectImage?.url || null,
      });

      await loadProjects();
      clearForm();
      setIsFormOpen(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not save this project. Please try again.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    setDeletingId(projectId);
    setError(null);

    try {
      await deleteProject(projectId);
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        if (next.length === 0) {
          setIsFormOpen(true);
        }
        return next;
      });
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not delete this project. Please try again.';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900">Projects</h3>
        <p className="text-gray-500 mt-1">Showcase your personal projects and portfolio.</p>
      </div>

      {!isFormOpen && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} /> New Project
        </button>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tech stack (comma-separated)</label>
              <input
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="React, TypeScript, Tailwind"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What does this project do? What problem does it solve?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Live demo URL (optional)</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub URL (optional)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project image (optional)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              {projectImage ? (
                <div className="space-y-3">
                  <img src={projectImage.url} alt="Project" className="w-full h-40 object-cover rounded-lg" />
                  <p className="text-sm text-gray-600">{projectImage.name}</p>
                  <button
                    type="button"
                    onClick={() => setProjectImage(null)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <ImageIcon size={18} />
                    <span className="text-sm font-semibold">Click to upload image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {isUploadingImage && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1B33] text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSaving ? 'Saving...' : 'Add Project'}
            </button>

            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Code2 size={18} className="text-gray-500" />
          <h4 className="text-lg font-bold text-gray-900">Saved Projects</h4>
        </div>

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-500 text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
            No projects added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <article key={project.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {project.image_url && (
                  <img src={project.image_url} alt={project.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-6 space-y-3">
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg">{project.name}</h5>
                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                  </div>

                  {project.tech_stack && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.split(',').map((tech, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1"
                      >
                        <ExternalLink size={12} /> Live Demo
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1"
                      >
                        <Github size={12} /> Code
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="text-xs font-semibold text-red-500 border border-red-100 rounded-full px-3 py-1 hover:bg-red-50 disabled:opacity-50 ml-auto"
                    >
                      {deletingId === project.id ? 'Deleting...' : (
                        <span className="inline-flex items-center gap-1">
                          <Trash2 size={12} /> Delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
