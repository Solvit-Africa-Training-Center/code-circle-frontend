export default function Footer(){
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch">

          <div>
            <div className="flex items-center gap-3">
              <span>&lt;/&gt;</span>
              <span className="text-lg font-semibold text-white">CODECIRCLE</span>
            </div>
            <p className="mt-4 text-sm text-slate-400 max-w-sm text-left">Professional coding club platform where verified admins create learning communities and members grow through structured, skill-verified education.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 text-left">Quick Links</h4>
            <ul className="text-sm text-slate-400 space-y-2 text-left">
              <li><a className="hover:text-white" href="#">About Us</a></li>
              <li><a className="hover:text-white" href="#">Clubs</a></li>
              <li><a className="hover:text-white" href="#">How It Works</a></li>
              <li><a className="hover:text-white" href="#">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 text-left">Legal</h4>
            <ul className="text-sm text-slate-400 space-y-2 text-left">
              <li><a className="hover:text-white" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white" href="#">Terms of Service</a></li>
              <li><a className="hover:text-white" href="#">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 text-left">Contact us</h4>
            <p className="text-sm text-slate-400 text-left">CodeCircle@gmail.com</p>
            <p className="text-sm text-slate-400 mt-2 text-left">+250 (780) 987-456</p>

            <div className="mt-6 flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H8.9v-2.89h1.54V9.41c0-1.52.9-2.36 2.28-2.36.66 0 1.34.12 1.34.12v1.48h-.76c-.75 0-.98.46-.98.94v1.13h1.67l-.27 2.89h-1.4V21.9C18.34 21.12 22 16.99 22 12z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.92c-.77.35-1.6.59-2.46.7a4.28 4.28 0 001.88-2.37 8.58 8.58 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.14 12.14 0 013 4.9a4.28 4.28 0 001.33 5.71 4.2 4.2 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.19c-.51.14-1.05.2-1.61.08.45 1.4 1.76 2.42 3.31 2.45A8.6 8.6 0 012 19.54a12.12 12.12 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56A8.64 8.64 0 0022 5.92z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.86 8.14 6.84 9.47.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.09-1.46-1.09-1.46-.89-.61.07-.6.07-.6 1 .07 1.54 1.03 1.54 1.03.88 1.52 2.31 1.08 2.87.83.09-.65.34-1.08.62-1.33-2.22-.26-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.28.1-2.67 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0112 6.84c.85.004 1.71.11 2.51.32 1.9-1.29 2.74-1.02 2.74-1.02.55 1.39.2 2.41.1 2.67.64.7 1.03 1.6 1.03 2.68 0 3.85-2.34 4.69-4.57 4.94.35.3.66.88.66 1.78 0 1.28-.01 2.31-.01 2.62 0 .26.18.58.69.48A10 10 0 0022 12c0-5.5-4.46-9.96-9.96-9.96z"/></svg>
              </a>
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <div>© 2026 CodeCircle. All rights reserved</div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white">Facebook</a>
            <a href="#" className="text-slate-400 hover:text-white">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-white">Instagram</a>
            <a href="#" className="text-slate-400 hover:text-white">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
