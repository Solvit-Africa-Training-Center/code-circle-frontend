import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

const categories = [
  'Web Development',
  'Software Development',
  'Mobile App Development',
  'Machine Learning',
  'Artificial Intelligence',
  'Data Engineering',
  'UI/UX Design',
  'Python Programming',
  'DevOps Engineering'
];

export default function LeaderCreateClubPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    description: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!selectedCategory) {
      nextErrors.category = 'Please choose a club category.';
    }
    if (!formState.name.trim()) {
      nextErrors.name = 'Club name is required.';
    }
    if (!formState.description.trim()) {
      nextErrors.description = 'Club description is required.';
    }
    if (!imageFile) {
      nextErrors.image = 'Please upload a club image.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const stored = localStorage.getItem('leaderCreatedClubs');
    const existing = stored ? JSON.parse(stored) : [];
    const createdClub = {
      id: Date.now(),
      name: formState.name.trim(),
      category: selectedCategory,
      description: formState.description.trim(),
      image: imagePreview,
      projectsCount: 0,
      modulesCount: 0,
      stats: { joinedMembers: 0 }
    };
    localStorage.setItem('leaderCreatedClubs', JSON.stringify([createdClub, ...existing]));
    addNotification(`Club created: ${createdClub.name}`);
    showToast('Club created successfully.');
    navigate('/leader/club');
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="create" />

        {/* Main */}
        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          {/* Top bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden">
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
                  <p className="text-slate-700 font-medium">Alex Rivera</p>
                  <p className="text-slate-400">Leader</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Create New Club</h1>
            <p className="text-sm text-slate-500 mt-2">
              Choose a category first, then add your club details.
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
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.category ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
              <button
                type="button"
                onClick={() => navigate('/leader/dashboard')}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Club
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
