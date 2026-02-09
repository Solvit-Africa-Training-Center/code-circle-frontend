import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type MobileSidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function MobileSidebarDrawer({ open, onClose, title, children }: MobileSidebarDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-slate-900/50 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-[78%] max-w-xs bg-blue-900 text-white shadow-xl transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800/60">
          <div className="text-sm font-semibold">{title || 'Menu'}</div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-blue-800/60">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="h-full overflow-y-auto px-4 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
