import {
  CheckCircle2,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import {
  useGetAdminLeaderApplicationsQuery,
  useReviewLeaderApplicationMutation,
} from '@/features/LeaderApplicationApi';
import type {
  AdminLeaderApplication,
  LeaderApplicationReviewStatus,
} from '@/types/leaderApplication';

const mapStatus = (
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED',
) => {
  if (status === 'APPROVED') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
};

const normalizeExternalUrl = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return null;

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/+/, '')}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return null;
  if (/example\.com\/mock-/i.test(trimmed)) return null;
  return parsed.toString();
};

type SortMode = 'latest' | 'score_desc' | 'score_asc' | 'name';

export default function AdminApplicationsPage() {
  type ReviewDecision = 'APPROVE' | 'REJECT';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');
  const [statusFilter, setStatusFilter] =
    useState<LeaderApplicationReviewStatus>('PENDING');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    userId: string;
    decision: ReviewDecision;
    applicantName: string;
  }>({
    open: false,
    userId: '',
    decision: 'APPROVE',
    applicantName: '',
  });
  const [reviewNote, setReviewNote] = useState('');

  const adminApplicationsQueryOptions = {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  } as const;

  const pendingQuery = useGetAdminLeaderApplicationsQuery(
    'PENDING',
    adminApplicationsQueryOptions,
  );
  const approvedQuery = useGetAdminLeaderApplicationsQuery(
    'APPROVED',
    adminApplicationsQueryOptions,
  );
  const rejectedQuery = useGetAdminLeaderApplicationsQuery(
    'REJECTED',
    adminApplicationsQueryOptions,
  );
  const [reviewLeaderApplication, { isLoading: isReviewing }] =
    useReviewLeaderApplicationMutation();

  const statusFilterOptions: Array<{
    value: LeaderApplicationReviewStatus;
    label: string;
    icon: ReactNode;
    tone: string;
    count: number;
  }> = [
    {
      value: 'PENDING',
      label: 'Pending',
      icon: <ShieldAlert className="h-4 w-4" />,
      tone: 'text-amber-700 bg-amber-50 border-amber-200',
      count: pendingQuery.data?.length ?? 0,
    },
    {
      value: 'APPROVED',
      label: 'Approved',
      icon: <ShieldCheck className="h-4 w-4" />,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      count: approvedQuery.data?.length ?? 0,
    },
    {
      value: 'REJECTED',
      label: 'Rejected',
      icon: <XCircle className="h-4 w-4" />,
      tone: 'text-rose-700 bg-rose-50 border-rose-200',
      count: rejectedQuery.data?.length ?? 0,
    },
  ];

  const applicationsForFilter: AdminLeaderApplication[] = useMemo(() => {
    if (statusFilter === 'APPROVED') return approvedQuery.data ?? [];
    if (statusFilter === 'REJECTED') return rejectedQuery.data ?? [];
    return pendingQuery.data ?? [];
  }, [
    approvedQuery.data,
    pendingQuery.data,
    rejectedQuery.data,
    statusFilter,
  ]);

  const displayedApplications = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    const filtered = applicationsForFilter.filter((app) => {
      if (!lowerQuery) return true;
      const category = app.test.category?.name ?? '';
      const haystack = `${app.user.name} ${app.user.email} ${category}`.toLowerCase();
      return haystack.includes(lowerQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'name') return a.user.name.localeCompare(b.user.name);
      if (sortMode === 'score_asc') return a.score - b.score;
      if (sortMode === 'score_desc') return b.score - a.score;
      const aDate = a.attemptedAt ? new Date(a.attemptedAt).getTime() : 0;
      const bDate = b.attemptedAt ? new Date(b.attemptedAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [applicationsForFilter, query, sortMode]);

  const isLoadingCurrent =
    statusFilter === 'APPROVED'
      ? approvedQuery.isLoading
      : statusFilter === 'REJECTED'
        ? rejectedQuery.isLoading
        : pendingQuery.isLoading;

  const isErrorCurrent =
    statusFilter === 'APPROVED'
      ? approvedQuery.isError
      : statusFilter === 'REJECTED'
        ? rejectedQuery.isError
        : pendingQuery.isError;

  const getErrorMessage = (err: unknown) => {
    const response = err as { data?: { message?: string | string[] } };
    const message = response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? 'Request failed.';
    if (typeof message === 'string' && message.trim()) return message;
    return 'Request failed.';
  };

  const openReviewModal = (
    userId: string,
    decision: ReviewDecision,
    applicantName: string,
  ) => {
    setReviewNote('');
    setReviewModal({
      open: true,
      userId,
      decision,
      applicantName,
    });
  };

  const closeReviewModal = () => {
    if (isReviewing) return;
    setReviewModal((prev) => ({ ...prev, open: false }));
    setReviewNote('');
  };

  const refreshAll = async () => {
    await Promise.all([
      pendingQuery.refetch(),
      approvedQuery.refetch(),
      rejectedQuery.refetch(),
    ]);
  };

  const handleReviewConfirm = async () => {
    if (!reviewModal.open) return;
    const { userId, decision, applicantName } = reviewModal;
    const note = reviewNote.trim();
    try {
      const result = await reviewLeaderApplication({
        userId,
        decision,
        note: note || undefined,
      }).unwrap();

      const backendMessage = result?.message?.trim();
      const emailIssue =
        Boolean(backendMessage) &&
        backendMessage.toLowerCase().includes('email could not be sent');

      setNoticeType(emailIssue ? 'error' : 'success');
      setNoticeTitle(
        decision === 'APPROVE' ? 'Application Approved' : 'Application Rejected',
      );
      setNotice(
        backendMessage ||
          (decision === 'APPROVE'
            ? `${applicantName}'s application has been approved.`
            : `${applicantName}'s application has been rejected.`),
      );
      setReviewModal((prev) => ({ ...prev, open: false }));
      setReviewNote('');
      await refreshAll();
    } catch (error) {
      setNoticeType('error');
      setNoticeTitle('Action Failed');
      setNotice(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="applications" />
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Admin Menu"
        >
          <AdminSidebar active="applications" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:ml-64 lg:px-8">
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
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Leader Applications
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track pending, approved, and failed applications from database.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {statusFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  statusFilter === option.value
                    ? `${option.tone} ring-2 ring-offset-2 ring-slate-300`
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    {option.icon}
                    {option.label}
                  </span>
                  <span className="text-2xl font-bold">{option.count}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, or category"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
              >
                <option value="latest">Sort: Latest</option>
                <option value="score_desc">Sort: Highest Score</option>
                <option value="score_asc">Sort: Lowest Score</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          {notice && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                noticeType === 'success'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-rose-200 bg-rose-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    noticeType === 'success'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {noticeType === 'success' ? 'OK' : '!'}
                </span>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      noticeType === 'success'
                        ? 'text-emerald-900'
                        : 'text-rose-900'
                    }`}
                  >
                    {noticeTitle}
                  </p>
                  <p
                    className={`mt-1 text-sm ${
                      noticeType === 'success'
                        ? 'text-emerald-800'
                        : 'text-rose-800'
                    }`}
                  >
                    {notice}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {isLoadingCurrent ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Loading applications...
              </div>
            ) : isErrorCurrent ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                Failed to load applications. Please ensure you are logged in as admin.
              </div>
            ) : displayedApplications.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No {statusFilter.toLowerCase()} applications found.
              </div>
            ) : (
              displayedApplications.map((app) => {
                const status = mapStatus(app.reviewStatus);
                const cvUrl = normalizeExternalUrl(app.user.cv);
                const degreeUrl = normalizeExternalUrl(app.user.degree);
                const videoUrl = normalizeExternalUrl(app.proctoringVideoUrl);
                const rawVideoUrl = app.proctoringVideoUrl?.trim();
                const resolvedVideoUrl = videoUrl ?? rawVideoUrl ?? null;
                const passStatus = app.passed ? 'Passed test' : 'Failed test';

                return (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {app.user.name || 'Applicant'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {app.user.email} - {app.test.category?.name ?? 'N/A'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Submitted:{' '}
                          {app.attemptedAt
                            ? new Date(app.attemptedAt).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : status === 'rejected'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {status}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            app.passed
                              ? 'bg-cyan-50 text-cyan-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {app.passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {passStatus}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-900">Phone:</span>{' '}
                          {app.user.phone ?? 'N/A'}
                        </p>
                        {cvUrl && (
                          <p>
                            <span className="font-semibold text-slate-900">CV:</span>{' '}
                            <a
                              href={cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline"
                            >
                              Open CV
                            </a>
                          </p>
                        )}
                        {degreeUrl && (
                          <p>
                            <span className="font-semibold text-slate-900">
                              Degree:
                            </span>{' '}
                            <a
                              href={degreeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline"
                            >
                              Open Degree
                            </a>
                          </p>
                        )}
                        <p>
                          <span className="font-semibold text-slate-900">
                            Proctoring Video:
                          </span>{' '}
                          {resolvedVideoUrl ? (
                            <a
                              href={resolvedVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline"
                            >
                              Open Video
                            </a>
                          ) : (
                            <span className="text-slate-500">Not uploaded yet</span>
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Test Result
                        </p>
                        <p className="mt-2">
                          Score:{' '}
                          <span className="font-semibold text-slate-900">
                            {app.score}%
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Review Status: {app.reviewStatus}
                        </p>
                      </div>
                    </div>

                    {status === 'pending' && (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() =>
                            openReviewModal(app.user.id, 'APPROVE', app.user.name)
                          }
                          className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
                          disabled={isReviewing}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            openReviewModal(app.user.id, 'REJECT', app.user.name)
                          }
                          className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:text-slate-400"
                          disabled={isReviewing}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {reviewModal.decision === 'APPROVE'
                ? 'Approve Application'
                : 'Reject Application'}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {reviewModal.applicantName}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {reviewModal.decision === 'APPROVE'
                ? 'Add an optional approval note for this candidate.'
                : 'Add an optional rejection reason for this candidate.'}
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Note
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  reviewModal.decision === 'APPROVE'
                    ? 'Optional note visible in admin review history'
                    : 'Optional reason for rejection'
                }
                className="min-h-[120px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
                disabled={isReviewing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleReviewConfirm()}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400 ${
                  reviewModal.decision === 'APPROVE'
                    ? 'bg-blue-900 hover:bg-blue-700'
                    : 'bg-rose-700 hover:bg-rose-600'
                }`}
                disabled={isReviewing}
              >
                {isReviewing
                  ? 'Saving...'
                  : reviewModal.decision === 'APPROVE'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
