'use client';

import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Loader2, Plus, Trash2 } from 'lucide-react';
import { createJob, deleteJob, getJobs, type Job } from '../lib/supabase';

type JobsProps = {
  username: string;
};

export default function Jobs({ username }: JobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getJobs(username);
        setJobs(data);
      } catch {
        setError('Could not load work experience right now.');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [username]);

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

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddJob = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.start_date) {
      setError('Title, company and start date are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const newJob = await createJob({
        username,
        title: form.title.trim(),
        company: form.company.trim(),
        start_date: form.start_date,
        end_date: form.end_date || null,
        description: form.description.trim() || null,
      });

      setJobs((prev) => [newJob, ...prev]);
      setForm({
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: '',
      });
    } catch {
      setError('Could not add this role right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setDeletingJobId(jobId);
    setError(null);

    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch {
      setError('Could not delete this role right now.');
    } finally {
      setDeletingJobId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900">Work Experience</h3>
        <p className="text-gray-500 mt-1">Add your roles so they show up on your public profile.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.title}
            onChange={(event) => handleFormChange('title', event.target.value)}
            placeholder="Role title"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <input
            value={form.company}
            onChange={(event) => handleFormChange('company', event.target.value)}
            placeholder="Company"
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Start date</p>
            <input
              type="date"
              value={form.start_date}
              onChange={(event) => handleFormChange('start_date', event.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">End date (optional)</p>
            <input
              type="date"
              value={form.end_date}
              onChange={(event) => handleFormChange('end_date', event.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <textarea
          value={form.description}
          onChange={(event) => handleFormChange('description', event.target.value)}
          placeholder="Short description of your responsibilities and impact"
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        <button
          type="button"
          onClick={handleAddJob}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E1B33] text-white rounded-xl text-sm font-semibold hover:bg-black disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {isSaving ? 'Adding...' : 'Add Role'}
        </button>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-sm text-gray-500">
          Loading work experience...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
          No roles yet. Add your first work experience entry.
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <article key={job.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600 mb-2">
                    <BriefcaseBusiness size={12} /> Experience
                  </div>
                  <p className="text-lg font-bold text-gray-900">{job.title}</p>
                  <p className="text-sm text-gray-700">{job.company}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateLabel(job.start_date)} - {job.end_date ? formatDateLabel(job.end_date) : 'Present'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteJob(job.id)}
                  disabled={deletingJobId === job.id}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 border border-red-100 rounded-full px-3 py-1 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingJobId === job.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete
                </button>
              </div>
              {job.description && (
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{job.description}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}