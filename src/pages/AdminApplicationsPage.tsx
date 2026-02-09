import { Menu } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import emailjs from '@emailjs/browser';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';

type Application = {
  id: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
  category: string;
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  bio?: string;
  cvFileName?: string;
  cvFileData?: string;
  degreeFileName?: string;
  degreeFileData?: string;
  testResult?: {
    score: number;
    totalQuestions: number;
    answeredCount: number;
  };
  approvedAt?: string;
  deniedAt?: string;
};

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'LDR-';
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

export default function AdminApplicationsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const raw = localStorage.getItem('leaderApplications');
      return raw ? (JSON.parse(raw) as Application[]) : [];
    } catch {
      return [];
    }
  });

  const pendingCount = useMemo(
    () => applications.filter((app) => app.status === 'pending').length,
    [applications]
  );

  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  const persistApplications = (next: Application[]) => {
    setApplications(next);
    localStorage.setItem('leaderApplications', JSON.stringify(next));
  };

  const handleApprove = async (app: Application) => {
    setNotice('');
    const password = generatePassword();
    const updated = applications.map((item) =>
      item.id === app.id
        ? { ...item, status: 'approved', approvedAt: new Date().toISOString() }
        : item
    );
    persistApplications(updated);

    const existingCreds = (() => {
      try {
        const raw = localStorage.getItem('leaderCredentials');
        return raw
          ? (JSON.parse(raw) as { email: string; password: string; approvedAt: string; fullName?: string }[])
          : [];
      } catch {
        return [];
      }
    })();
    const filtered = existingCreds.filter((cred) => cred.email !== app.email);
    const nextCreds = [{ email: app.email, password: '', approvedAt: new Date().toISOString(), fullName: app.fullName }, ...filtered];
    localStorage.setItem('leaderCredentials', JSON.stringify(nextCreds));

    const existingTemp = (() => {
      try {
        const raw = localStorage.getItem('leaderTempCredentials');
        return raw
          ? (JSON.parse(raw) as { email: string; password: string; expiresAt: string; issuedAt: string; fullName?: string }[])
          : [];
      } catch {
        return [];
      }
    })();
    const tempExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const tempCreds = [
      { email: app.email, password, issuedAt: new Date().toISOString(), expiresAt: tempExpiresAt, fullName: app.fullName },
      ...existingTemp.filter((cred) => cred.email !== app.email)
    ];
    localStorage.setItem('leaderTempCredentials', JSON.stringify(tempCreds));

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    try {
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Missing EmailJS configuration.');
      }
      await emailjs.send(
        serviceId,
        templateId,
        {
          email: app.email,
          name: app.fullName,
          username: app.email,
          password,
          from_name: 'CodeCircle'
        },
        publicKey
      );
      setNoticeType('success');
      setNotice('Approval email sent with temporary password.');
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'text' in error
          ? String((error as { text?: string }).text)
          : 'Email service error.';
      setNoticeType('error');
      setNotice(
        `Approval saved, but email failed to send. ${message} Please confirm EmailJS settings.`
      );
    }
  };

  const handleDeny = (app: Application) => {
    const updated = applications.map((item) =>
      item.id === app.id
        ? { ...item, status: 'denied', deniedAt: new Date().toISOString() }
        : item
    );
    persistApplications(updated);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="applications" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="applications" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">Applications</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Leader Applications</h1>
            <p className="text-sm text-slate-500 mt-2">
              Review submitted applications and approve or deny.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Pending applications: <span className="font-semibold text-slate-900">{pendingCount}</span></p>
          </div>

          {notice && (
            <div
              className={`mt-4 rounded-xl border p-4 text-sm ${
                noticeType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {notice}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {applications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No applications submitted yet.
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{app.fullName}</p>
                      <p className="text-sm text-slate-500">{app.email} • {app.category}</p>
                      <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(app.submittedAt).toLocaleString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : app.status === 'denied'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-900">Phone:</span> {app.phone}</p>
                      <p><span className="font-semibold text-slate-900">Experience:</span> {app.experience}</p>
                      {app.cvFileName && (
                        <p>
                          <span className="font-semibold text-slate-900">CV:</span>{' '}
                          {app.cvFileData ? (
                            <a
                              href={app.cvFileData}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline"
                            >
                              View {app.cvFileName}
                            </a>
                          ) : (
                            app.cvFileName
                          )}
                        </p>
                      )}
                      {app.degreeFileName && (
                        <p>
                          <span className="font-semibold text-slate-900">Degree:</span>{' '}
                          {app.degreeFileData ? (
                            <a
                              href={app.degreeFileData}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline"
                            >
                              View {app.degreeFileName}
                            </a>
                          ) : (
                            app.degreeFileName
                          )}
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Test Result</p>
                      <p className="mt-2">
                        Score: <span className="font-semibold text-slate-900">{app.testResult?.score ?? 0}</span> /
                        <span className="ml-1">{app.testResult?.totalQuestions ?? 0}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Answered: {app.testResult?.answeredCount ?? 0}</p>
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleApprove(app)}
                        className="px-5 py-2 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-700"
                      >
                        Approve & Generate Password
                      </button>
                      <button
                        onClick={() => handleDeny(app)}
                        className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
