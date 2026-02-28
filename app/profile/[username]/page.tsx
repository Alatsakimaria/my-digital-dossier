import { Download, ExternalLink, Github, Linkedin, Mail, MapPin, Pin } from 'lucide-react';
import { getJobs, getLatestCV, getProfileSettings, getProjects } from '@/lib/supabase';

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const [profile, projects, jobs, cvUrl] = await Promise.all([
    getProfileSettings(username),
    getProjects(username),
    getJobs(username),
    getLatestCV(username),
  ]);

  const displayName = profile?.full_name || username;
  const roleTitle = profile?.role_title || 'Portfolio Owner';
  const tagline = profile?.tagline || 'Personal portfolio and proof-of-work profile.';
  const location = profile?.location;
  const email = profile?.email;
  const linkedinUrl = profile?.linkedin_url;
  const githubUrl = profile?.github_url;

  const featuredProjects = [...projects]
    .sort((a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)))
    .slice(0, 6);

  const skills = Array.from(
    new Set(
      projects
        .flatMap((project) => (project.tech_stack ? project.tech_stack.split(',') : []))
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  ).slice(0, 12);

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

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[#1E1B33] text-white py-14 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Public Portfolio</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3">{displayName}</h1>
            <p className="text-indigo-200 text-lg mt-2 font-semibold">{roleTitle}</p>
            <p className="text-indigo-100 mt-3 max-w-2xl">{tagline}</p>

            <div className="flex flex-wrap gap-4 mt-5 text-indigo-100">
              {location && (
                <span className="inline-flex items-center gap-1 text-sm">
                  <MapPin size={15} /> {location}
                </span>
              )}
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-sm hover:text-white">
                  <Mail size={15} /> {email}
                </a>
              )}
            </div>
          </div>

          <a
            href={cvUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
              cvUrl
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-white/20 text-white/70 pointer-events-none'
            }`}
          >
            <Download size={18} /> {cvUrl ? 'Download CV' : 'CV not available'}
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {featuredProjects.length} shown
              </span>
            </div>

            {featuredProjects.length === 0 ? (
              <p className="text-sm text-gray-500">No projects published yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredProjects.map((project) => (
                  <article key={project.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{project.name}</h3>
                      {project.is_pinned && (
                        <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full inline-flex items-center gap-1">
                          <Pin size={10} /> Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.tech_stack
                        ?.split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((item) => (
                          <span
                            key={`${project.id}-${item}`}
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                          >
                            {item}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-gray-700 hover:text-gray-900 inline-flex items-center gap-1"
                        >
                          <Github size={12} /> Source Code
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience</h2>
            {jobs.length === 0 ? (
              <p className="text-sm text-gray-500">No work experience added yet.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <article key={job.id} className="border border-gray-100 rounded-xl p-4">
                    <p className="font-bold text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateLabel(job.start_date)} -{' '}
                      {job.end_date ? formatDateLabel(job.end_date) : 'Present'}
                    </p>
                    {job.description && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{job.description}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Quick Facts</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Projects:</span> {projects.length}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Roles:</span> {jobs.length}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Skills:</span> {skills.length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Skills</h3>
            {skills.length === 0 ? (
              <p className="text-sm text-gray-500 mt-3">No skills listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <span key={skill} className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-sm font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Links</h3>
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Github size={16} /> GitHub
              </a>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}