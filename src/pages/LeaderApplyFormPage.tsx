import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { useRegisterForTestMutation } from '@/features/LeaderApplicationApi';
import type { LeaderApplySelection } from '@/types/leaderApplication';

type LeaderFormState = {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  bio: string;
  cvFile: File | null;
  degreeFile: File | null;
};

const MAX_UPLOAD_SIZE_MB = 4;
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export default function LeaderApplyFormPage() {
  const navigate = useNavigate();
  const [registerForTest, { isLoading }] = useRegisterForTestMutation();
  const selection = useMemo<LeaderApplySelection | null>(() => {
    const raw = sessionStorage.getItem('leaderApplySelection');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LeaderApplySelection;
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState<LeaderFormState>({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    bio: '',
    cvFile: null,
    degreeFile: null
  });
  const [error, setError] = useState('');

  const handleChange = (field: keyof LeaderFormState, value: string | File | null) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const getErrorMessage = (err: unknown) => {
    const response = err as { data?: { message?: string | string[] } };
    const message = response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? 'Unable to submit your application.';
    if (typeof message === 'string' && message.trim()) return message;
    return 'Unable to submit your application. Please review your details and try again.';
  };

  const handleNext = async () => {
    setError('');
    if (!selection?.categoryId) {
      setError('Please choose a club category first.');
      return;
    }
    if (!form.fullName || !form.email || !form.phone || !form.experience || !form.bio || !form.cvFile) {
      setError('Please complete all required fields and upload your CV.');
      return;
    }
    if (form.cvFile.size > MAX_UPLOAD_SIZE_BYTES) {
      setError(`CV must be ${MAX_UPLOAD_SIZE_MB}MB or smaller.`);
      return;
    }
    if (form.degreeFile && form.degreeFile.size > MAX_UPLOAD_SIZE_BYTES) {
      setError(`Degree file must be ${MAX_UPLOAD_SIZE_MB}MB or smaller.`);
      return;
    }

    sessionStorage.removeItem('leaderApplyResult');
    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const mergedBio = `Experience: ${form.experience.trim()}\n\n${form.bio.trim()}`;
      const response = await registerForTest({
        fullName: form.fullName.trim(),
        email: normalizedEmail,
        phone: form.phone.trim(),
        bio: mergedBio,
        cv: form.cvFile,
        degree: form.degreeFile,
      }).unwrap();

      sessionStorage.setItem(
        'leaderApplySession',
        JSON.stringify({
          categoryId: selection.categoryId,
          categoryName: selection.categoryName,
          userId: response.userId,
          email: response.email,
        }),
      );
    } catch (err) {
      setError(getErrorMessage(err));
      return;
    }

    navigate('/leader/apply/protocol');
  };

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
        </div>
        <div className="absolute inset-0 z-[1]"></div>
        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Leader Application</h1>
          <Link to="/leader/apply" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
            <span>«</span>
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 relative w-full py-12 bg-slate-100">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-blue-900">Your Information</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Applying to lead: <span className="font-semibold text-slate-900">{selection?.categoryName || 'Not selected'}</span>
                </p>
              </div>
              <Link
                to="/leader/apply"
                className="text-sm font-semibold text-blue-900 hover:text-blue-700"
              >
                Change category
              </Link>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  placeholder="+1 555 000 000"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Leadership Experience</label>
                <input
                  value={form.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  placeholder="2+ years mentoring"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">Short Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="mt-2 w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                placeholder="Tell us about your background and leadership style."
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Upload CV</label>
                <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    type="file"
                    onChange={(e) => handleChange('cvFile', e.target.files?.[0] ?? null)}
                    className="text-sm text-slate-600"
                  />
                  {form.cvFile && (
                    <p className="text-xs text-slate-500 mt-2">Selected: {form.cvFile.name}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Upload Degree</label>
                <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    type="file"
                    onChange={(e) => handleChange('degreeFile', e.target.files?.[0] ?? null)}
                    className="text-sm text-slate-600"
                  />
                  {form.degreeFile && (
                    <p className="text-xs text-slate-500 mt-2">Selected: {form.degreeFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Continue to Protocol'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
