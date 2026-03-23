import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#121212] py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t-[4px] border-[#e8e8e4] pt-8">
          {/* Copyright */}
          <div className="text-[#8c8c8c] font-black uppercase tracking-widest text-xs">
            <p>VOID © {new Date().getFullYear()} NUCLEUSX. NO RIGHTS SECURED.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 border-[2px] border-[#8c8c8c] text-[#8c8c8c] hover:border-[#ff3300] hover:text-[#ff3300] transition-colors hover:rotate-6 bg-black"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 border-[2px] border-[#8c8c8c] text-[#8c8c8c] hover:border-[#ff3300] hover:text-[#ff3300] transition-colors hover:-rotate-6 bg-black"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
