'use client';

import { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, File, Loader2, Trash2 } from 'lucide-react';
// 1. Import the supabase client you created earlier
import { supabase } from '../lib/supabase';

type UploadedDoc = {
  name: string;
  url: string;
  path: string;
};

type VaultProps = {
  username: string;
};

export default function Vault({ username }: VaultProps) {
  const [cvFiles, setCvFiles] = useState<UploadedDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGrades, setIsUploadingGrades] = useState(false);
  const [gradeFiles, setGradeFiles] = useState<UploadedDoc[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const [{ data: cvData }, { data: gradeData }] = await Promise.all([
          supabase.storage.from('dossier-files').list(`cvs/${username}`, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } }),
          supabase.storage.from('dossier-files').list(`grades/${username}`, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } }),
        ]);

        if (cvData) {
          const mapped = cvData.map((file) => {
            const path = `cvs/${username}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from('dossier-files')
              .getPublicUrl(path);
            return { name: file.name, url: urlData.publicUrl, path };
          });
          setCvFiles(mapped);
        }

        if (gradeData) {
          const mapped = gradeData.map((file) => {
            const path = `grades/${username}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from('dossier-files')
              .getPublicUrl(path);
            return { name: file.name, url: urlData.publicUrl, path };
          });
          setGradeFiles(mapped);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to load stored files:', message);
      }
    };

    loadFiles();
  }, [username]);

  // 2. Updated function to handle REAL cloud upload
  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const filePath = `cvs/${username}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('dossier-files')
        .upload(filePath, file);

      if (error) {
        if (error.message.includes('already exists')) {
          const { data: urlData } = supabase.storage
            .from('dossier-files')
            .getPublicUrl(filePath);
          setCvFiles((prev) => [{ name: file.name, url: urlData.publicUrl, path: filePath }, ...prev]);
          return;
        }
        throw error; // This will be caught by the catch block below
      }
      if (data) {
        const { data: urlData } = supabase.storage
          .from('dossier-files')
          .getPublicUrl(filePath);
        setCvFiles((prev) => [{ name: file.name, url: urlData.publicUrl, path: filePath }, ...prev]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Silent Check:', message);
    } finally {
        setIsUploading(false);
    }   
  };

  const handleGradesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploadingGrades(true);

    try {
      const uploads = Array.from(e.target.files).map(async (file) => {
        const filePath = `grades/${username}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from('dossier-files')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('dossier-files')
          .getPublicUrl(filePath);

        return { name: file.name, url: urlData.publicUrl, path: filePath };
      });

      const uploaded = await Promise.all(uploads);
      setGradeFiles((prev) => [...uploaded, ...prev]);
      e.target.value = '';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Grades upload failed:', message);
    } finally {
      setIsUploadingGrades(false);
    }
  };

  const handleDeleteFile = async (file: UploadedDoc, kind: 'cv' | 'grade') => {
    try {
      const { error } = await supabase.storage
        .from('dossier-files')
        .remove([file.path]);

      if (error) throw error;

      if (kind === 'cv') {
        setCvFiles((prev) => prev.filter((item) => item.path !== file.path));
      } else {
        setGradeFiles((prev) => prev.filter((item) => item.path !== file.path));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Delete file failed:', message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900">Document Vault</h3>
        <p className="text-gray-500 mt-1">Securely manage your professional and academic documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CV UPLOAD CARD */}
        <div className={`group p-10 border-2 border-dashed rounded-[2.5rem] bg-white transition-all flex flex-col items-center text-center ${cvFiles.length > 0 ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-200 hover:border-indigo-400'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${cvFiles.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
            {isUploading ? <Loader2 className="animate-spin" size={32} /> : cvFiles.length > 0 ? <CheckCircle size={32} /> : <Upload size={32} />}
          </div>
          
          <h4 className="text-xl font-bold text-gray-900">{isUploading ? "Uploading..." : "Upload CV"}</h4>
          <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
            Select your latest resume in PDF format.
          </p>

          <input type="file" id="cv-input" className="hidden" accept=".pdf" onChange={handleCvChange} disabled={isUploading} />
          <label htmlFor="cv-input" className={`mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black'}`}>
            {isUploading ? "Uploading..." : "Upload CV"}
          </label>
        </div>

        {/* GRADES UPLOAD CARD (Keeping this as is for now) */}
        <div className="group p-10 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white hover:border-amber-400 transition-all flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 rounded-2xl flex items-center justify-center mb-6 transition-colors">
            <FileText size={32} />
          </div>
          
          <h4 className="text-xl font-bold text-gray-900">Academic Records</h4>
          <p className="text-sm text-gray-500 mt-2 max-w-[200px]">Upload certificates, transcripts, or course grades.</p>

          <input type="file" id="grades-input" className="hidden" multiple onChange={handleGradesChange} disabled={isUploadingGrades} />
          <label htmlFor="grades-input" className={`mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold transition-all ${isUploadingGrades ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black'}`}>
            {isUploadingGrades ? 'Uploading...' : 'Upload Academic Records'}
          </label>

        </div>

      </div>

      {(cvFiles.length > 0 || gradeFiles.length > 0) && (
        <div className="space-y-6">
          {cvFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900">Uploaded CVs</h4>
              {cvFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[240px]">{file.name}</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Open PDF
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file, 'cv')}
                      className="text-xs font-semibold text-red-500 border border-red-100 rounded-full px-3 py-1 hover:bg-red-50"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {gradeFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900">Uploaded Academic Records</h4>
              {gradeFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[240px]">{file.name}</p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Open PDF
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file, 'grade')}
                      className="text-xs font-semibold text-red-500 border border-red-100 rounded-full px-3 py-1 hover:bg-red-50"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recruiter Visibility Tip */}
      <div className="bg-[#1E1B33] p-6 rounded-[2rem] text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <File size={20} className="text-indigo-300" />
            </div>
            <div>
                <p className="font-bold">Recruiter Visibility</p>
                <p className="text-xs text-gray-400">Documents are hidden from your public profile by default.</p>
            </div>
        </div>
        <button className="text-xs font-bold bg-white text-[#1E1B33] px-4 py-2 rounded-lg hover:bg-gray-100">Settings</button>
      </div>
    </div>
  );
}