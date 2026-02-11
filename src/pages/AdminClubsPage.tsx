import { Menu, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { clubs as baseClubs } from '@/data/clubs';

export default function AdminClubsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [categoryError, setCategoryError] = useState('');
  const [storedCategories, setStoredCategories] = useState<
    { id: number; name: string; icon: string }[]
  >(() => {
    try {
      const raw = localStorage.getItem('clubCategories');
      const parsed = raw ? (JSON.parse(raw) as Array<string | { id: number; name: string; icon: string }>) : [];
      return parsed.map((item, index) =>
        typeof item === 'string'
          ? { id: Date.now() + index, name: item, icon: '🏷️' }
          : item
      );
    } catch {
      return [];
    }
  });
  const pageSize = 6;

  const clubs = useMemo(() => {
    const leaderCreated = (() => {
      try {
        const raw = localStorage.getItem('leaderCreatedClubs');
        return raw ? (JSON.parse(raw) as typeof baseClubs) : [];
      } catch {
        return [];
      }
    })();
    return [...leaderCreated, ...baseClubs];
  }, []);

  const categories = useMemo(() => {
    const clubCategories = clubs.map((club) => club.category).filter(Boolean);
    const storedNames = storedCategories.map((category) => category.name);
    const merged = [...clubCategories, ...storedNames]
      .map((item) => item.trim())
      .filter(Boolean);
    return Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b));
  }, [clubs, storedCategories]);

  const filteredClubs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return clubs.filter((club) => {
      const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!search) return true;
      const tagMatch = club.tags?.some((tag) => tag.toLowerCase().includes(search));
      return (
        club.name.toLowerCase().includes(search) ||
        club.description.toLowerCase().includes(search) ||
        club.category.toLowerCase().includes(search) ||
        tagMatch
      );
    });
  }, [clubs, searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredClubs.length / pageSize));
  const pagedClubs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClubs.slice(start, start + pageSize);
  }, [currentPage, filteredClubs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const persistCategories = (next: { id: number; name: string; icon: string }[]) => {
    setStoredCategories(next);
    localStorage.setItem('clubCategories', JSON.stringify(next));
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', icon: '' });
    setCategoryError('');
    setShowCategoryModal(true);
  };

  const openEditCategory = (category: { id: number; name: string; icon: string }) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, icon: category.icon });
    setCategoryError('');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    const name = categoryForm.name.trim();
    const icon = categoryForm.icon.trim() || '🏷️';
    if (!name) {
      setCategoryError('Category name is required.');
      return;
    }
    const exists = storedCategories.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingCategoryId
    );
    if (exists) {
      setCategoryError('Category already exists.');
      return;
    }
    if (editingCategoryId) {
      const updated = storedCategories.map((item) =>
        item.id === editingCategoryId ? { ...item, name, icon } : item
      );
      persistCategories(updated);
    } else {
      const next = [{ id: Date.now(), name, icon }, ...storedCategories];
      persistCategories(next);
    }
    setShowCategoryModal(false);
  };

  const handleIconUpload = (file?: File | null) => {
    if (!file) {
      setCategoryForm((prev) => ({ ...prev, icon: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setCategoryForm((prev) => ({ ...prev, icon: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (!confirm('Delete this category?')) return;
    const next = storedCategories.filter((item) => item.id !== categoryId);
    persistCategories(next);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="clubs" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="clubs" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">All Clubs</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">All Clubs</h1>
            <p className="text-sm text-slate-500 mt-2">
              Review active clubs and their categories.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Club Categories</h2>
                <button
                  onClick={openCreateCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  New
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Add, edit, and delete categories available for leaders.
              </p>
              <div className="mt-4 space-y-3">
                {storedCategories.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    No custom categories yet.
                  </div>
                )}
                {storedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      {category.icon?.startsWith('data:') ? (
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="h-6 w-6 rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-base">{category.icon || '🏷️'}</span>
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditCategory(category)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">Filter Clubs</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full outline-none"
                    placeholder="Search clubs, tags, or categories..."
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Showing {filteredClubs.length} clubs</span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedClubs.map((club) => (
              <div key={club.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{club.category}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{club.name}</p>
                <p className="text-sm text-slate-600 mt-2">{club.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(club.tags?.slice(0, 4) ?? []).map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {pagedClubs.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                No clubs match your filters yet.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + (pagedClubs.length ? 1 : 0)}-
              {(currentPage - 1) * pageSize + pagedClubs.length} of {filteredClubs.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      currentPage === page ? 'bg-blue-900 text-white' : 'border border-slate-200 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingCategoryId ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Icon</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {categoryForm.icon?.startsWith('data:') ? (
                      <img src={categoryForm.icon} alt="Category icon" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl">{categoryForm.icon || '🏷️'}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="category-icon-upload"
                      className="hidden"
                      onChange={(event) => handleIconUpload(event.target.files?.[0])}
                    />
                    <label
                      htmlFor="category-icon-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Upload icon
                    </label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(event) => setCategoryForm({ ...categoryForm, icon: event.target.value })}
                      placeholder="Or use emoji (e.g. ☁️)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(event) => {
                    setCategoryForm({ ...categoryForm, name: event.target.value });
                    if (categoryError) setCategoryError('');
                  }}
                  placeholder="e.g. Cloud Engineering"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    categoryError ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {categoryError && <p className="mt-1 text-xs text-red-600">{categoryError}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
