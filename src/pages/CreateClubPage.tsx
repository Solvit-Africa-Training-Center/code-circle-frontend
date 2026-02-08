import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

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

export default function CreateClubPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    description: ''
  });
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

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    navigate('/clubs');
  };

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 relative mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8 py-16 mt-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Create a Club</h1>
          <p className="text-slate-600 mt-2">
            Start by choosing a category for your club, then add your details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Choose Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  className={`rounded-xl border px-4 py-4 text-left transition-all ${
                    selectedCategory === category
                      ? 'border-blue-900 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <p className="text-sm font-semibold">{category}</p>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-sm text-red-600 mt-2">{errors.category}</p>}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
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
      </div>

      <Footer />
    </div>
  );
}
