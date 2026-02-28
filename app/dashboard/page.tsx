'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  CalendarDays,
  Sparkles,
  Pencil,
  Save,
  Pin,
  LogOut,
  LogIn,
  Copy,
  Check,
} from 'lucide-react';
import Vault from '../../components/Vault';
import Jobs from '../../components/Jobs';
import Projects from '../../components/Projects';
import {
  getJobs,
  getProfileSettings,
  getProjects,
  supabase,
  upsertProfileSettings,
  type Job,
  type ProfileSettings,
  type Project,
} from '../../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [isHomeLoading, setIsHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [isPublicLinkCopied, setIsPublicLinkCopied] = useState(false);
  const [appOrigin, setAppOrigin] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    role_title: '',
    tagline: '',
    location: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    github_username: '',
  });

  const connectedGithubUsername = useMemo(() => {
    const explicitUsername = profileForm.github_username?.trim();
    if (explicitUsername) return explicitUsername;

    const raw = profileForm.github_url?.trim();
    if (!raw) return null;

    try {
      const normalized = raw.startsWith('http') ? raw : `https://${raw}`;
      const parsed = new URL(normalized);
      if (!parsed.hostname.includes('github.com')) return null;
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      return pathParts[0] ?? null;
    } catch {
      return null;
    }
  }, [profileForm.github_url, profileForm.github_username]);

  const publicPortfolioUrl = useMemo(() => {
    if (!profileUsername) return '';
    if (!appOrigin) return `/profile/${profileUsername}`;
    return `${appOrigin}/profile/${profileUsername}`;
  }, [appOrigin, profileUsername]);

  const buildDefaultProfileForm = useCallback(
    (username: string, email: string | null, data?: ProfileSettings | null) => ({
      full_name: data?.full_name ?? username,
      role_title: data?.role_title ?? 'Software Engineer',
      tagline:
        data?.tagline ??
        'I build reliable data-driven products and clean user experiences.',
      location: data?.location ?? 'Athens, Greece',
      email: data?.email ?? email ?? `contact@${username}.com`,
      linkedin_url: data?.linkedin_url ?? '',
      github_url: data?.github_url ?? '',
      github_username: data?.github_username ?? '',
    }),
    [],
  );

  const normalizeUsername = useCallback((value: string) => {
    const cleaned = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);

    return cleaned || `user_${Date.now().toString().slice(-6)}`;
  }, []);

  useEffect(() => {
    const loadAuthUser = async () => {
      setIsAuthLoading(true);

      try {
        const localUserRaw = window.localStorage.getItem('dossier_local_user');
        if (localUserRaw) {
          const localUser = JSON.parse(localUserRaw) as {
            username?: string;
            full_name?: string | null;
          };

          if (localUser.username) {
            const normalized = normalizeUsername(localUser.username);
            setProfileUsername(normalized);
            setAuthUserId(null);
            setUserEmail(`${normalized}@test.local`);
            setIsAuthLoading(false);
            return;
          }
        }

        setAuthUserId(null);
        setProfileUsername(null);
        setUserEmail(null);
        router.replace('/login');
      } catch {
        setAuthUserId(null);
        setProfileUsername(null);
        setUserEmail(null);
        router.replace('/login');
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadAuthUser();

    return undefined;
  }, [normalizeUsername, router]);

  useEffect(() => {
    setAppOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!profileUsername) return;

    const loadHomeData = async () => {
      setIsHomeLoading(true);
      setHomeError(null);

      try {
        const [jobsData, projectsData] = await Promise.all([
          getJobs(profileUsername, authUserId),
          getProjects(profileUsername, authUserId),
        ]);

        const profileData = await getProfileSettings(profileUsername, authUserId);

        setJobs(jobsData);
        setProjects(projectsData);
        setProfile(profileData);
        setProfileForm(buildDefaultProfileForm(profileUsername, userEmail, profileData));
      } catch {
        setHomeError('Could not load your portfolio summary right now.');
      } finally {
        setIsHomeLoading(false);
      }
    };

    loadHomeData();
  }, [authUserId, buildDefaultProfileForm, profileUsername, userEmail]);

  const featuredProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)))
        .slice(0, 3),
    [projects],
  );
  const latestJobs = useMemo(() => jobs.slice(0, 2), [jobs]);
  const topSkills = useMemo(() => {
    const frequency = new Map<string, number>();

    for (const project of projects) {
      if (!project.tech_stack) continue;

      for (const rawSkill of project.tech_stack.split(',')) {
        const skill = rawSkill.trim();
        if (!skill) continue;
        frequency.set(skill, (frequency.get(skill) ?? 0) + 1);
      }
    }

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill]) => skill);
  }, [projects]);

  const totalYearsExperience = useMemo(() => {
    if (jobs.length === 0) return 0;

    const now = new Date();
    const totalMonths = jobs.reduce((acc, job) => {
      const start = new Date(job.start_date);
      const end = job.end_date ? new Date(job.end_date) : now;
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      return acc + Math.max(0, months);
    }, 0);

    return Math.round((totalMonths / 12) * 10) / 10;
  }, [jobs]);

  const handleCopyPublicPortfolioLink = async () => {
    if (!publicPortfolioUrl) return;

    try {
      await navigator.clipboard.writeText(publicPortfolioUrl);
      setIsPublicLinkCopied(true);
      window.setTimeout(() => setIsPublicLinkCopied(false), 1500);
    } catch {
      setHomeError('Could not copy public portfolio link.');
    }
  };

  const handleProfileFieldChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProjectsChanged = useCallback((nextProjects: Project[]) => {
    setProjects(nextProjects);
  }, []);

  const handleSaveProfile = async () => {
    if (!profileUsername) return;

    setIsSavingProfile(true);
    setHomeError(null);

    try {
      const saved = await upsertProfileSettings({
        auth_user_id: authUserId ?? null,
        username: profileUsername,
        full_name: profileForm.full_name.trim() || null,
        role_title: profileForm.role_title.trim() || null,
        tagline: profileForm.tagline.trim() || null,
        location: profileForm.location.trim() || null,
        email: profileForm.email.trim() || null,
        linkedin_url: profileForm.linkedin_url.trim() || null,
        github_url: profileForm.github_url.trim() || null,
        github_username: profileForm.github_username.trim() || null,
      });

      setProfile(saved);
      setIsEditingProfile(false);
    } catch {
      setHomeError('Could not save profile details right now.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    if (!profileUsername) return;

    setProfileForm(buildDefaultProfileForm(profileUsername, userEmail, profile));
    setIsEditingProfile(false);
    setHomeError(null);
  };

  const handleSignOut = async () => {
    window.localStorage.removeItem('dossier_local_user');
    try {
      await supabase.auth.signOut();
    } finally {
      setAuthUserId(null);
      setProfileUsername(null);
      setUserEmail(null);
      router.replace('/login');
    }
  };

  const formatDateLabel = (value: string) => {
    try {
      return new Date(value).toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  };

  if (isAuthLoading || !profileUsername) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-sm font-semibold text-gray-600">Loading account...</div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full bg-white overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#1E1B33] text-gray-400 flex flex-col p-4">
        <div className="flex items-center gap-2 px-2 mb-8 text-white font-bold text-xl">Dossier</div>
        
        <nav className="flex-1 space-y-2">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} /> Home
          </div>

          <div 
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeTab === 'vault' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
          >
            <FileText size={18} /> Vault
          </div>

          <div
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeTab === 'jobs' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
          >
            <BriefcaseBusiness size={18} /> Jobs
          </div>

          <div
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeTab === 'projects' ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`}
          >
            <Code2 size={18} /> Projects
          </div>
        </nav>
      </aside>

      {/* CENTRAL CANVAS */}
      <section className="flex-1 flex flex-col bg-white overflow-hidden">
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-10">
          <p className="text-lg font-bold text-gray-800">
            {activeTab === 'dashboard'
              ? 'Portfolio Home'
              : activeTab === 'jobs'
                ? 'Work Experience'
                : activeTab === 'projects'
                  ? 'Projects'
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </p>
          {authUserId ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50"
            >
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50"
            >
              <LogIn size={14} /> Logout
            </button>
          )}
        </header>

        <div className="flex-1 p-10 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto">
            
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={12} /> Portfolio Snapshot
                      </div>
                      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4">
                        {profileForm.full_name || profileUsername}
                      </h2>
                      <p className="text-gray-700 mt-3 font-semibold">
                        {profileForm.role_title || 'Software Engineer'}
                      </p>
                      <p className="text-gray-600 mt-2 max-w-2xl">
                        {profileForm.tagline ||
                          'I build reliable data-driven products and clean user experiences.'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{profileForm.location || 'Athens, Greece'}</p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {profileForm.email && (
                          <a
                            href={`mailto:${profileForm.email}`}
                            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                          >
                            {profileForm.email}
                          </a>
                        )}
                        {profileForm.linkedin_url && (
                          <a
                            href={profileForm.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            LinkedIn
                          </a>
                        )}
                        {(profileForm.github_url || connectedGithubUsername) && (
                          <a
                            href={
                              profileForm.github_url ||
                              `https://github.com/${connectedGithubUsername}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!isEditingProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                        >
                          <Pencil size={14} /> Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={isSavingProfile}
                            className="px-5 py-3 bg-[#1E1B33] text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 inline-flex items-center gap-2"
                          >
                            <Save size={14} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelProfileEdit}
                            disabled={isSavingProfile}
                            className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('projects')}
                        className="px-5 py-3 bg-[#1E1B33] text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
                      >
                        Explore Projects
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('jobs')}
                        className="px-5 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                      >
                        View Experience
                      </button>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={profileForm.full_name}
                        onChange={(e) => handleProfileFieldChange('full_name', e.target.value)}
                        placeholder="Full name"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <input
                        value={profileForm.role_title}
                        onChange={(e) => handleProfileFieldChange('role_title', e.target.value)}
                        placeholder="Role title"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <textarea
                        value={profileForm.tagline}
                        onChange={(e) => handleProfileFieldChange('tagline', e.target.value)}
                        placeholder="Tagline"
                        rows={3}
                        className="md:col-span-2 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <input
                        value={profileForm.location}
                        onChange={(e) => handleProfileFieldChange('location', e.target.value)}
                        placeholder="Location"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                        placeholder="Email"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <input
                        type="url"
                        value={profileForm.linkedin_url}
                        onChange={(e) => handleProfileFieldChange('linkedin_url', e.target.value)}
                        placeholder="LinkedIn URL"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <input
                        value={profileForm.github_username}
                        onChange={(e) =>
                          handleProfileFieldChange('github_username', e.target.value)
                        }
                        placeholder="GitHub username for import (e.g. octocat)"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <input
                        type="url"
                        value={profileForm.github_url}
                        onChange={(e) => handleProfileFieldChange('github_url', e.target.value)}
                        placeholder="GitHub URL"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  )}
                </section>

                <section className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Public Portfolio Link
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Share this link with HR to view your full portfolio page.
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-2 break-all">
                        {publicPortfolioUrl}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCopyPublicPortfolioLink}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {isPublicLinkCopied ? <Check size={14} /> : <Copy size={14} />}
                        {isPublicLinkCopied ? 'Copied' : 'Copy Link'}
                      </button>
                      <a
                        href={publicPortfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1B33] text-white rounded-xl text-sm font-semibold hover:bg-black"
                      >
                        <ExternalLink size={14} /> Open Public Page
                      </a>
                    </div>
                  </div>
                </section>

                {homeError && (
                  <p className="text-sm font-medium text-red-600 mt-5">{homeError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Projects</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{projects.length}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Work Roles</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{jobs.length}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Skills</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{topSkills.length}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Years Exp.</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalYearsExperience}</p>
                  </div>
                </div>

                <section className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Featured Projects</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      See all projects
                    </button>
                  </div>

                  {isHomeLoading ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-500">
                      Loading portfolio overview...
                    </div>
                  ) : featuredProjects.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
                      No projects yet. Add your first one in the Projects tab.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {featuredProjects.map((project) => (
                        <article
                          key={project.id}
                          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full flex flex-col"
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-gray-900 truncate">{project.name}</h4>
                            {project.is_pinned && (
                              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                                <Pin size={10} /> Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-3">{project.description}</p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {project.tech_stack?.split(',').slice(0, 2).map((skill) => (
                              <span
                                key={`${project.id}-${skill}`}
                                className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>

                          <div className="mt-auto pt-4 flex items-center gap-2">
                            {project.live_url && (
                              <a
                                href={project.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                              >
                                <ExternalLink size={12} /> Live
                              </a>
                            )}
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                              >
                                <ExternalLink size={12} /> Code
                              </a>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Experience Highlights</h3>
                      <CalendarDays size={16} className="text-gray-400" />
                    </div>

                    {latestJobs.length === 0 ? (
                      <p className="text-sm text-gray-500">No roles yet. Add your experience in the Jobs tab.</p>
                    ) : (
                      <div className="space-y-4">
                        {latestJobs.map((job) => (
                          <div key={job.id} className="border border-gray-100 rounded-xl p-4">
                            <p className="font-bold text-gray-900">{job.title}</p>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateLabel(job.start_date)} - {job.end_date ? formatDateLabel(job.end_date) : 'Present'}
                            </p>
                            {job.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Core Skills</h3>
                    {topSkills.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Add tech stacks to projects and your top skills will appear here.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {topSkills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-sm font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'vault' && <Vault username={profileUsername} />}
            {activeTab === 'jobs' && <Jobs username={profileUsername} authUserId={authUserId} />}
            {activeTab === 'projects' && (
              <Projects
                username={profileUsername}
                authUserId={authUserId}
                githubUsername={connectedGithubUsername}
                onProjectsChanged={handleProjectsChanged}
              />
            )}

          </div>
        </div>
      </section>
    </main>
  );
}