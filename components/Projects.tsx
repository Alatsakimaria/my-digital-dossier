'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Code2,
  Github,
  ExternalLink,
  Plus,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Star,
  Pencil,
  Save,
  ChevronLeft,
  ChevronRight,
  Pin,
} from 'lucide-react';
import {
  addProjectImages,
  createProject,
  deleteProject,
  getProjectImages,
  getProjects,
  updateProject,
  type Project,
} from '@/lib/supabase';
import { getGithubRepos, type GithubRepo } from '@/lib/github';
import { supabase } from '@/lib/supabase';

type ProjectsProps = {
  username: string;
  onProjectsChanged?: (projects: Project[]) => void;
};

type ProjectImage = {
  name: string;
  url: string;
  path: string;
};

export default function Projects({ username, onProjectsChanged }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [projectImage, setProjectImage] = useState<ProjectImage | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectPhotos, setProjectPhotos] = useState<string[]>([]);
  const [isLoadingProjectPhotos, setIsLoadingProjectPhotos] = useState(false);
  const [isUploadingProjectPhotos, setIsUploadingProjectPhotos] = useState(false);
  const [projectModalError, setProjectModalError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [togglingPinId, setTogglingPinId] = useState<string | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectTechStack, setEditProjectTechStack] = useState('');
  const [editProjectLiveUrl, setEditProjectLiveUrl] = useState('');
  const [editProjectGithubUrl, setEditProjectGithubUrl] = useState('');
  const [editProjectPinned, setEditProjectPinned] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)),
      ),
    [projects],
  );

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load manual projects
      const manualProjects = await getProjects(username);
      setProjects(manualProjects);

      // Load GitHub repos
      try {
        const repos = await getGithubRepos(username);
        setGithubRepos(repos);
      } catch {
        console.log('Could not load GitHub repos, continuing with manual projects only');
      }

      setIsFormOpen(manualProjects.length === 0);
    } catch {
      setError('Could not load projects right now.');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    onProjectsChanged?.(projects);
  }, [projects, onProjectsChanged]);

  const clearForm = () => {
    setName('');
    setDescription('');
    setTechStack('');
    setLiveUrl('');
    setGithubUrl('');
    setProjectImage(null);
    setIsPinned(false);
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
        is_pinned: isPinned,
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

  const loadProjectPhotos = useCallback(async (project: Project) => {
    setIsLoadingProjectPhotos(true);
    setProjectModalError(null);

    try {
      const images = await getProjectImages(project.id);
      const dbUrls = images.map((image) => image.image_url);
      const fallback = project.image_url ? [project.image_url] : [];
      setProjectPhotos(Array.from(new Set([...fallback, ...dbUrls])));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load project photos.';
      setProjectModalError(message);
      setProjectPhotos(project.image_url ? [project.image_url] : []);
    } finally {
      setIsLoadingProjectPhotos(false);
    }
  }, []);

  const handleOpenProjectModal = async (project: Project) => {
    setSelectedProject(project);
    setIsEditingProject(false);
    setEditProjectName(project.name || '');
    setEditProjectDescription(project.description || '');
    setEditProjectTechStack(project.tech_stack || '');
    setEditProjectLiveUrl(project.live_url || '');
    setEditProjectGithubUrl(project.github_url || '');
    setEditProjectPinned(Boolean(project.is_pinned));
    await loadProjectPhotos(project);
  };

  const handleCloseProjectModal = () => {
    setSelectedProject(null);
    setProjectPhotos([]);
    setProjectModalError(null);
    setIsUploadingProjectPhotos(false);
    setActivePhotoIndex(null);
    setIsEditingProject(false);
    setIsUpdatingProject(false);
  };

  const handleSaveProjectEdits = async () => {
    if (!selectedProject) return;

    if (!editProjectName.trim() || !editProjectDescription.trim()) {
      setProjectModalError('Project name and detailed explanation are required.');
      return;
    }

    setIsUpdatingProject(true);
    setProjectModalError(null);

    try {
      const updatedProject = await updateProject(selectedProject.id, {
        name: editProjectName.trim(),
        description: editProjectDescription.trim(),
        tech_stack: editProjectTechStack.trim() || null,
        live_url: editProjectLiveUrl.trim() || null,
        github_url: editProjectGithubUrl.trim() || null,
        is_pinned: editProjectPinned,
      });

      setSelectedProject(updatedProject);
      setProjects((prev) => prev.map((project) => (project.id === updatedProject.id ? updatedProject : project)));
      setIsEditingProject(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update project details.';
      setProjectModalError(message);
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleTogglePinned = async (project: Project) => {
    setTogglingPinId(project.id);
    setError(null);

    try {
      const updatedProject = await updateProject(project.id, {
        is_pinned: !project.is_pinned,
      });

      setProjects((prev) => prev.map((item) => (item.id === updatedProject.id ? updatedProject : item)));
      setSelectedProject((prev) => (prev && prev.id === updatedProject.id ? updatedProject : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update pin status.';
      setError(message);
    } finally {
      setTogglingPinId(null);
    }
  };

  const handleOpenPhotoViewer = (index: number) => {
    setActivePhotoIndex(index);
  };

  const handleClosePhotoViewer = () => {
    setActivePhotoIndex(null);
  };

  const showPrevPhoto = () => {
    if (projectPhotos.length === 0) return;
    setActivePhotoIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + projectPhotos.length) % projectPhotos.length;
    });
  };

  const showNextPhoto = () => {
    if (projectPhotos.length === 0) return;
    setActivePhotoIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % projectPhotos.length;
    });
  };

  useEffect(() => {
    if (activePhotoIndex === null) return;

    const totalPhotos = projectPhotos.length;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePhotoViewer();
      } else if (e.key === 'ArrowLeft') {
        if (totalPhotos === 0) return;
        setActivePhotoIndex((prev) => {
          if (prev === null) return 0;
          return (prev - 1 + totalPhotos) % totalPhotos;
        });
      } else if (e.key === 'ArrowRight') {
        if (totalPhotos === 0) return;
        setActivePhotoIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % totalPhotos;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePhotoIndex, projectPhotos.length]);

  const handleProjectPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProject || !isEditingProject) return;

    setIsUploadingProjectPhotos(true);
    setProjectModalError(null);

    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const fileName = `projects/${selectedProject.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('dossier-files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('dossier-files').getPublicUrl(fileName);

          return publicUrl;
        }),
      );

      await addProjectImages(selectedProject.id, uploadedUrls);

      await loadProjectPhotos(selectedProject);
      e.target.value = '';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not upload photos.';
      setProjectModalError(message);
    } finally {
      setIsUploadingProjectPhotos(false);
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
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My App"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tech stack (comma-separated)
              </label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Live demo URL (optional)
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                GitHub URL (optional)
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-200"
            />
            Pin this project as one of my best
          </label>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project image (optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
              {projectImage ? (
                <div className="space-y-3">
                  <Image
                    src={projectImage.url}
                    alt="Project"
                    width={1200}
                    height={640}
                    unoptimized
                    className="w-full h-40 object-cover rounded-lg"
                  />
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
            {isUploadingImage && (
              <p className="text-sm text-gray-500 mt-2">Uploading image...</p>
            )}
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

            {(projects.length > 0 || githubRepos.length > 0) && (
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
          <h4 className="text-lg font-bold text-gray-900">All Projects</h4>
        </div>

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-500 text-sm">
            Loading projects...
          </div>
        ) : projects.length === 0 && githubRepos.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
            No projects yet. Add one to get started!
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Manual projects */}
              {sortedProjects.map((project) => {
                const primaryUrl = project.github_url || project.live_url;
                const isGithubPrimary = Boolean(project.github_url);

                return (
                  <article
                    key={project.id}
                    onClick={() => handleOpenProjectModal(project)}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-[200px] flex flex-col cursor-pointer"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <h5 className="font-bold text-gray-900 text-lg truncate">
                            {project.name}
                          </h5>
                          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                            Custom
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePinned(project);
                          }}
                          disabled={togglingPinId === project.id}
                          className={
                            project.is_pinned
                              ? 'text-xs font-semibold text-amber-700 border border-amber-200 bg-amber-100 rounded-full px-2 py-1 hover:bg-amber-200 disabled:opacity-50 inline-flex items-center gap-1 whitespace-nowrap'
                              : 'text-xs font-semibold text-gray-600 border border-gray-200 bg-gray-50 rounded-full px-2 py-1 hover:bg-gray-100 disabled:opacity-50 inline-flex items-center gap-1 whitespace-nowrap'
                          }
                        >
                          <Pin size={10} />
                          {togglingPinId === project.id ? 'Saving...' : project.is_pinned ? 'Pinned' : 'Pin'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2 mt-auto">
                      {primaryUrl && (
                        <a
                          href={primaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={
                            isGithubPrimary
                              ? 'text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1'
                              : 'text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1'
                          }
                        >
                          {isGithubPrimary ? <Github size={12} /> : <ExternalLink size={12} />}
                          {isGithubPrimary ? 'Code' : 'Live Demo'}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProjectModal(project);
                        }}
                        className="text-xs font-semibold text-gray-700 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50"
                      >
                        Open
                      </button>
                      {project.tech_stack && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {project.tech_stack.split(',')[0].trim()}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        disabled={deletingId === project.id}
                        className="text-xs font-semibold text-red-500 border border-red-100 rounded-full px-3 py-1 hover:bg-red-50 disabled:opacity-50 ml-auto"
                      >
                        {deletingId === project.id ? (
                          'Deleting...'
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Trash2 size={12} /> Delete
                          </span>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}

              {/* GitHub repos */}
              {githubRepos.map((repo) => (
                <article
                  key={repo.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow h-[200px] flex flex-col"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-gray-900 text-lg truncate">{repo.name}</h5>
                      <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full whitespace-nowrap">
                        GitHub
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-2 mt-auto">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1"
                    >
                      <Github size={12} /> View Code
                    </a>
                    {repo.language && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {repo.language}
                      </span>
                    )}
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1 ml-auto">
                      <Star size={12} fill="currentColor" /> {repo.stargazers_count}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {selectedProject && (
              <div
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onClick={handleCloseProjectModal}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2rem] border border-gray-100 shadow-xl flex flex-col overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={handleCloseProjectModal}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 text-lg font-semibold z-10"
                    aria-label="Close"
                  >
                    ×
                  </button>

                  <div className="flex-1 overflow-y-auto">
                  <div className="p-6 md:p-8 pr-16 md:pr-20 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h5>
                      {!isEditingProject ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProject(true);
                            setProjectModalError(null);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveProjectEdits}
                            disabled={isUpdatingProject}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1B33] text-white rounded-xl text-sm font-semibold hover:bg-black disabled:opacity-50"
                          >
                            {isUpdatingProject ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                            {isUpdatingProject ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProject(false);
                              setProjectModalError(null);
                              setEditProjectName(selectedProject.name || '');
                              setEditProjectDescription(selectedProject.description || '');
                              setEditProjectTechStack(selectedProject.tech_stack || '');
                              setEditProjectLiveUrl(selectedProject.live_url || '');
                              setEditProjectGithubUrl(selectedProject.github_url || '');
                              setEditProjectPinned(Boolean(selectedProject.is_pinned));
                            }}
                            disabled={isUpdatingProject}
                            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {!isEditingProject ? (
                      <>
                        {selectedProject.tech_stack && (
                          <p className="text-sm text-gray-500 mt-2">
                            Tech stack: <span className="font-semibold text-gray-700">{selectedProject.tech_stack}</span>
                          </p>
                        )}
                        <div className="mt-4 space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">How it works</p>
                            <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                              {selectedProject.description || 'No explanation added yet.'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedProject.live_url && (
                              <a
                                href={selectedProject.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1"
                              >
                                <ExternalLink size={12} /> Live Demo
                              </a>
                            )}
                            {selectedProject.github_url && (
                              <a
                                href={selectedProject.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1"
                              >
                                <Github size={12} /> Source Code
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Project name
                          </label>
                          <input
                            value={editProjectName}
                            onChange={(e) => setEditProjectName(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Detailed project explanation
                          </label>
                          <textarea
                            value={editProjectDescription}
                            onChange={(e) => setEditProjectDescription(e.target.value)}
                            rows={6}
                            placeholder="Explain what this project does, who it helps, the main features, and how it works technically."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            value={editProjectTechStack}
                            onChange={(e) => setEditProjectTechStack(e.target.value)}
                            placeholder="Tech stack"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <input
                            type="url"
                            value={editProjectLiveUrl}
                            onChange={(e) => setEditProjectLiveUrl(e.target.value)}
                            placeholder="Live URL"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <input
                            type="url"
                            value={editProjectGithubUrl}
                            onChange={(e) => setEditProjectGithubUrl(e.target.value)}
                            placeholder="GitHub URL"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={editProjectPinned}
                            onChange={(e) => setEditProjectPinned(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-200"
                          />
                          Pin this project on Home and Projects
                        </label>
                      </div>
                    )}
                    {isEditingProject && (
                      <p className="text-xs text-gray-500 mt-3">
                        Edit details above and upload new gallery photos below, then click Save.
                      </p>
                    )}
                  </div>

                  <div className="p-6 md:p-8 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <h6 className="text-base font-bold text-gray-900">Project Photos</h6>
                      {isEditingProject ? (
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1B33] text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-black transition-all">
                          <ImageIcon size={16} />
                          {isUploadingProjectPhotos ? 'Uploading...' : 'Upload gallery photos'}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleProjectPhotosUpload}
                            disabled={isUploadingProjectPhotos}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <span className="text-xs text-gray-500">Click Edit to upload new photos</span>
                      )}
                    </div>

                    {projectModalError && (
                      <p className="text-sm font-medium text-red-600">{projectModalError}</p>
                    )}

                    {isLoadingProjectPhotos ? (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Loading photos...
                      </p>
                    ) : projectPhotos.length === 0 ? (
                      <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
                        {isEditingProject
                          ? 'No photos yet. Click “Upload gallery photos” to add the first ones.'
                          : 'No photos yet. Click Edit to upload project gallery photos.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {projectPhotos.map((url, idx) => (
                          <button
                            key={`${url}-${idx}`}
                            type="button"
                            onClick={() => handleOpenPhotoViewer(idx)}
                            className="relative rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors h-32 md:h-40"
                          >
                            <Image
                              src={url}
                              alt={`Project photo ${idx + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              unoptimized
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>

                  {activePhotoIndex !== null && projectPhotos[activePhotoIndex] && (
                    <div
                      className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center p-4"
                      onClick={handleClosePhotoViewer}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showPrevPhoto();
                        }}
                        className="absolute left-4 md:left-6 w-10 h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <Image
                        src={projectPhotos[activePhotoIndex]}
                        alt={`Project photo ${activePhotoIndex + 1}`}
                        width={1800}
                        height={1200}
                        unoptimized
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl"
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showNextPhoto();
                        }}
                        className="absolute right-4 md:right-6 w-10 h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white"
                        aria-label="Next photo"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}