'use client'; 

import { useState } from 'react';
import { getGithubRepos, type GithubRepo } from '../lib/github';
import { LayoutDashboard, Github, FileText, Star, ExternalLink, BriefcaseBusiness, Code2 } from 'lucide-react';
import Vault from '../components/Vault';
import Jobs from '../components/Jobs';
import Projects from '../components/Projects';

export default function Home() {
  const profileUsername = 'Alatsakimaria';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch real data
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const data = await getGithubRepos(profileUsername); 
      setRepos(data);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
      alert("Could not find GitHub user. Check the username in the code!");
    } finally {
      setIsLoading(false);
    }
  };

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
            <LayoutDashboard size={18} /> Dashboard
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
            {activeTab === 'jobs' ? 'Work Experience' : activeTab === 'projects' ? 'Projects' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </p>
        </header>

        <div className="flex-1 p-10 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto">
            
            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Hello, Maria!</h2>
                <p className="text-gray-500 mb-8">Here is your current professional overview.</p>
                
                {!isConnected ? (
                  /* EMPTY STATE */
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Github size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No projects synced</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">Connect your GitHub to automatically import your top repositories.</p>
                    <button 
                      onClick={handleConnect} 
                      disabled={isLoading}
                      className="px-8 py-3 bg-[#1E1B33] text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        "Connect GitHub"
                      )}
                    </button>
                  </div>
                ) : (
                  /* LIVE REPO GRID */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {repos.map((repo) => (
                      <div key={repo.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <Github size={20} />
                          </div>
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-600 transition-colors">
                            <ExternalLink size={18} />
                          </a>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 truncate pr-4">{repo.name}</h4>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2 h-10">
                            {repo.description || "Project created by a talented developer."}
                        </p>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star size={14} fill="currentColor" /> {repo.stargazers_count}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-600">{repo.language || "Web"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vault' && <Vault />}
            {activeTab === 'jobs' && <Jobs username={profileUsername} />}
            {activeTab === 'projects' && <Projects username={profileUsername} />}

          </div>
        </div>
      </section>
    </main>
  );
}