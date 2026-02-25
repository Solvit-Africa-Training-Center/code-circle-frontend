import { useEffect, useMemo, useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getLeaderDisplayName } from '@/utils/authUser';
import { getAuthUser } from '@/utils/authUser';
import { useGetActiveCategoriesQuery } from '@/features/CategoriesApi';
import { useCreateClubMutation } from '@/features/ClubsApi';

export default function LeaderCreateClubPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const leaderName = getLeaderDisplayName();
  const authUser = getAuthUser();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    description: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: apiCategories = [] } = useGetActiveCategoriesQuery();
  const [createClub, { isLoading: isCreating }] = useCreateClubMutation();

  const joinedCategory = useMemo(() => {
    const authEmail = authUser?.email?.toLowerCase();
    if (!authEmail) return '';

    const fromLeaderApplySelection = (() => {
      try {
        const raw = sessionStorage.getItem('leaderApplySelection');
        if (!raw) return '';
        const parsed = JSON.parse(raw) as { categoryName?: string };
        return parsed.categoryName?.trim() ?? '';
      } catch {
        return '';
      }
    })();
    if (fromLeaderApplySelection) return fromLeaderApplySelection;

    const fromLeaderApplySession = (() => {
      try {
        const raw = sessionStorage.getItem('leaderApplySession');
        if (!raw) return '';
        const parsed = JSON.parse(raw) as { categoryName?: string };
        return parsed.categoryName?.trim() ?? '';
      } catch {
        return '';
      }
    })();
    if (fromLeaderApplySession) return fromLeaderApplySession;

    const fromExistingLeaderClub = (() => {
      try {
        const raw = localStorage.getItem('leaderCreatedClubs');
        const clubs = raw
          ? (JSON.parse(raw) as Array<{ leaderEmail?: string; category?: string }>)
          : [];
        const matched = clubs.find(
          (club) =>
            club.leaderEmail?.toLowerCase() === authEmail &&
            typeof club.category === 'string' &&
            club.category.trim(),
        );
        return matched?.category?.trim() ?? '';
      } catch {
        return '';
      }
    })();
    if (fromExistingLeaderClub) return fromExistingLeaderClub;

    const fromLeaderApplication = (() => {
      try {
        const raw = localStorage.getItem('leaderApplications');
        const apps = raw
          ? (JSON.parse(raw) as Array<{ email?: string; category?: string; status?: string }>)
          : [];
        const matched = apps.find(
          (app) =>
            app.email?.toLowerCase() === authEmail &&
            typeof app.category === 'string' &&
            app.category.trim() &&
            app.status !== 'denied',
        );
        return matched?.category?.trim() ?? '';
      } catch {
        return '';
      }
    })();
    return fromLeaderApplication;
  }, [authUser?.email]);

  const categories = useMemo(() => {
    if (!joinedCategory) {
      return [] as Array<{ id: string; name: string }>;
    }

    const byName = apiCategories.find(
      (item) => item.name?.trim().toLowerCase() === joinedCategory.toLowerCase(),
    );

    if (byName) {
      return [{ id: byName.id, name: byName.name }];
    }

    const fromSession = (() => {
      try {
        const raw = sessionStorage.getItem('leaderApplySelection');
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { categoryId?: string; categoryName?: string };
        if (
          parsed.categoryId &&
          parsed.categoryName?.trim().toLowerCase() === joinedCategory.toLowerCase()
        ) {
          return { id: parsed.categoryId, name: parsed.categoryName.trim() };
        }
      } catch {
        return null;
      }
      return null;
    })();

    return fromSession ? [fromSession] : [{ id: '', name: joinedCategory }];
  }, [apiCategories, joinedCategory]);

  useEffect(() => {
    if (categories.length === 1) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!joinedCategory) {
      nextErrors.category = 'No joined category found for this leader account.';
    } else if (!selectedCategoryId) {
      nextErrors.category = 'Please choose a club category.';
    }
    if (!formState.name.trim()) {
      nextErrors.name = 'Club name is required.';
    }
    if (!formState.description.trim()) {
      nextErrors.description = 'Club description is required.';
    }
    if (!imagePreview) {
      nextErrors.image = 'Please upload a club image.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const createdClub = await createClub({
        name: formState.name.trim(),
        categoryId: selectedCategoryId,
        description: formState.description.trim(),
      }).unwrap();

      addNotification(`Club created: ${createdClub.name}`);
      showToast('Club created successfully.');
      navigate('/leader/club');
    } catch (err) {
      const apiMessage = (err as { data?: { message?: string } })?.data?.message;
      setErrors({
        ...nextErrors,
        submit:
          typeof apiMessage === 'string' && apiMessage.trim()
            ? apiMessage
            : 'Failed to create club.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="create" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="create" variant="mobile" />
        </MobileSidebarDrawer>

        {/* Main */}
        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          {/* Top bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <CodeCircleLogo className="text-blue-700" />
            </div>
            <div className="flex-1 md:max-w-xl">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full outline-none" placeholder="Search clubs, members..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LeaderNotificationsBell />
              <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2">
                <div className="h-7 w-7 rounded-full bg-slate-200"></div>
                <div className="text-xs">
                  <p className="text-slate-700 font-medium">{leaderName}</p>
                  <p className="text-slate-400">Leader</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Create New Club</h1>
            <p className="text-sm text-slate-500 mt-2">
              Your club category is locked to the category you joined.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-10">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Select Category</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Club Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  disabled={categories.length <= 1}
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.category ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">
                    {joinedCategory ? 'Select your category' : 'No category assigned'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-sm text-red-600 mt-2">{errors.category}</p>}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club Image</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    id="club-image-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      if (errors.image) setErrors({ ...errors, image: '' });
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setImagePreview(String(reader.result || ''));
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setImagePreview('');
                      }
                    }}
                  />
                  <label htmlFor="club-image-upload" className="cursor-pointer block">
                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Club preview"
                      className="mt-4 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                </div>
                {errors.image && <p className="text-sm text-red-600 mt-2">{errors.image}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club Name</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => {
                    setFormState({ ...formState, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Enter your club name"
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-sm text-red-600 mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formState.description}
                  onChange={(e) => {
                    setFormState({ ...formState, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Describe what this club is about"
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.description ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.description && <p className="text-sm text-red-600 mt-2">{errors.description}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {errors.submit && (
                <p className="w-full text-sm text-red-600">{errors.submit}</p>
              )}
              <button
                type="button"
                onClick={() => navigate('/leader/dashboard')}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!joinedCategory || isCreating}
                className="rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {isCreating ? 'Creating...' : 'Create Club'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
