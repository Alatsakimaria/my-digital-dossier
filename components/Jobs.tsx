'use client';

import { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, Building2, CalendarDays, Plus, Loader2, Trash2 } from 'lucide-react';
import { createJob, deleteJob, getJobs, type Job } from '@/lib/supabase';

type JobsProps = {
  username: string;
  authUserId?: string | null;
};

export default function Jobs({ username, authUserId }: JobsProps) {
  const monthOptions = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 40 }, (_, idx) => String(currentYear - idx));

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
  const [description, setDescription] = useState('');

  const buildDate = (year: string, month: string) => `${year}-${month}-01`;

  const formatMonthYear = (dateValue: string | null) => {
    if (!dateValue) return 'Present';

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
  };

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getJobs(username, authUserId);
      setJobs(data);
      setIsFormOpen(data.length === 0);
    } catch {
      setError('Could not load jobs right now.');
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, username]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const clearForm = () => {
    setTitle('');
    setCompany('');
    setStartMonth('');
    setStartYear('');
    setEndMonth('');
    setEndYear('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !company || !startMonth || !startYear) {
      setError('Title, company and start date are required.');
      return;
    }

    if ((endMonth && !endYear) || (!endMonth && endYear)) {
      setError('Please select both end month and end year, or leave both empty.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createJob({
        auth_user_id: authUserId ?? null,
        username,
        title,
        company,
        start_date: buildDate(startYear, startMonth),
        end_date: endMonth && endYear ? buildDate(endYear, endMonth) : null,
        description: description || null,
      });

      await loadJobs();
      clearForm();
      setIsFormOpen(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not save this job. Please try again.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    setDeletingId(jobId);
    setError(null);

    try {
      await deleteJob(jobId);
      setJobs((prev) => {
        const next = prev.filter((job) => job.id !== jobId);
        if (next.length === 0) {
          setIsFormOpen(true);
        }
        return next;
      });
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not delete this job. Please try again.';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900">Work Experience</h3>
        <p className="text-gray-500 mt-1">Add the jobs you have done to build your professional timeline.</p>
      </div>

      {!isFormOpen && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} /> New Job
        </button>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Labs"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start date</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Month</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End date (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Month</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What did you build or lead in this role?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1B33] text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isSaving ? 'Saving...' : 'Add Job'}
            </button>

            {jobs.length > 0 && (
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
          <BriefcaseBusiness size={18} className="text-gray-500" />
          <h4 className="text-lg font-bold text-gray-900">Saved Jobs</h4>
        </div>

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-500 text-sm">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
            No jobs added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <article key={job.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg">{job.title}</h5>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Building2 size={14} /> {job.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 h-fit">
                      <CalendarDays size={12} />
                      {formatMonthYear(job.start_date)} - {formatMonthYear(job.end_date)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      className="text-xs font-semibold text-red-500 border border-red-100 rounded-full px-3 py-1 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === job.id ? 'Deleting...' : (
                        <span className="inline-flex items-center gap-1">
                          <Trash2 size={12} /> Delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                {job.description && <p className="text-sm text-gray-600 mt-4">{job.description}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
