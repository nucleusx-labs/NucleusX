import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0A] py-8 border-t border-[#2D0A5B]">
      <div className="w-full max-w-360 mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">
            VOID © {new Date().getFullYear()} NUCLEUSX. NO RIGHTS SECURED.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
