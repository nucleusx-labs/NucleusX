export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-ncx-border relative z-[1]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ncx-text-subtle text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ncx-gain" style={{ animation: 'ncx-pulse-dot 2s ease-in-out infinite' }} />
            Live on QF · 3426
            <span className="text-ncx-border-strong mx-2">·</span>
            NucleusX © {new Date().getFullYear()}
          </p>

          <div className="flex items-center gap-2">
            <a
              href="https://x.com/nucleusxtr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-ncx-border text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://t.me/nucleusxtrade"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-ncx-border text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.944 4.667a1 1 0 0 0-1.076-.153L2.91 12.02a1 1 0 0 0 .08 1.858l4.86 1.72 1.72 4.86a1 1 0 0 0 1.858.08l7.506-17.958a1 1 0 0 0-.99-1.913ZM9.62 15.3l-.95 2.684-.95-2.684 7.754-7.754L9.62 15.3Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
