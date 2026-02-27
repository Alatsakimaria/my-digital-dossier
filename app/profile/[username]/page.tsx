import { Github, Linkedin, Mail, Download, MapPin, Star, ExternalLink } from 'lucide-react';
import { getLatestCV } from '@/lib/supabase';
import { getGithubRepos } from '@/lib/github'; // Import the GitHub fetcher

export default async function PublicProfile({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  // 1. Fetch Real Data in Parallel
  const [cvUrl, repos] = await Promise.all([
    getLatestCV(username),
    getGithubRepos(username) // This uses the name from the URL
  ]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="bg-[#1E1B33] text-white py-20 px-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl font-extrabold capitalize">{username}</h1>
            <p className="text-indigo-300 text-xl mt-2 font-medium">Software Engineer & Data Specialist</p>
            <div className="flex gap-4 mt-6 text-gray-400">
              <span className="flex items-center gap-1 text-sm"><MapPin size={16}/> Athens, Greece</span>
              <span className="flex items-center gap-1 text-sm"><Mail size={16}/> contact@{username}.com</span>
            </div>
          </div>

          <a 
            href={cvUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 bg-[#00D97E] hover:bg-[#00c26f] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 ${!cvUrl && 'opacity-50 cursor-not-allowed pointer-events-none'}`}
          >
            <Download size={20} /> 
            {cvUrl ? 'Download CV' : 'No CV Available'}
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-16 px-10 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          
          {/* 2. DYNAMIC PROJECTS SECTION */}
          <section>
            <h2 className="text-2xl font-bold border-b pb-4 mb-6">Featured Projects</h2>
            <div className="grid gap-6">
              {repos.length > 0 ? repos.map((repo: any) => (
                <a 
                  key={repo.id} 
                  href={repo.html_url} 
                  target="_blank" 
                  className="p-6 border rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group block"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-3 text-gray-400">
                      {repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1 text-sm"><Star size={14} fill="currentColor"/> {repo.stargazers_count}</span>
                      )}
                      <ExternalLink size={18} />
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                    {repo.description || "A professional project showcasing advanced development skills."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                      {repo.language || "TypeScript"}
                    </span>
                  </div>
                </a>
              )) : (
                <p className="text-gray-400 italic">No public projects found for this user.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-4 mb-6">Education & Grades</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">BSc in Computer Science</h3>
                  <p className="text-gray-500">University of Technology</p>
                </div>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold border border-gray-200">GPA: 3.9/4.0</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'TypeScript', 'Tailwind', 'Python', 'Supabase'].map((skill) => (
                <span key={skill} className="bg-white px-4 py-2 rounded-xl text-sm border border-gray-200 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-colors">
              <Linkedin size={20} className="text-[#0077B5]" /> LinkedIn Profile
            </button>
            <a 
              href={`https://github.com/${username}`} 
              target="_blank"
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
            >
              <Github size={20} /> GitHub Portfolio
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}