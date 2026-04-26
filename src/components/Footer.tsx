import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const REPO_URL = 'https://github.com/nucleusx-labs/NucleusX'
const X_URL = 'https://x.com/nucleusxtr'
const TELEGRAM_URL = 'https://t.me/nucleusxtrade'

const productLinks = [
  { label: 'Swap', to: '/swap' },
  { label: 'Liquidity', to: '/pools' },
]

const resourceLinks = [
  { label: 'Documentation' },
  { label: 'Support', href: TELEGRAM_URL },
]

const communityLinks = [
  { label: 'GitHub', href: REPO_URL },
  { label: 'X', href: X_URL },
  { label: 'Telegram', href: TELEGRAM_URL },
]

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="ncx-num text-[10px] uppercase tracking-[0.18em] text-ncx-text-subtle mb-4">
      {children}
    </h3>
  )
}

function FooterExternalLink({ href, children }: { href?: string, children: ReactNode }) {
  if (!href) {
    return (
      <span className="text-sm text-ncx-text-muted/70 cursor-default">
        {children}
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-ncx-text-muted hover:text-ncx-text transition-colors duration-200"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="w-full border-t border-ncx-border relative z-[1] mt-8">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.9fr_0.9fr] gap-10 lg:gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-ncx-border-strong bg-ncx-wash text-ncx-purple-300 font-semibold tracking-tight">
                N
              </span>
              <div>
                <div className="text-xl font-semibold tracking-tight text-ncx-text">Nuclx</div>
                <div className="text-sm text-ncx-text-muted">Fast swaps and liquidity on QF Network.</div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-ncx-text-muted">
              Trade, provide liquidity, and access QF-native markets through a cleaner on-chain experience.
            </p>
          </div>

          <div>
            <FooterHeading>Products</FooterHeading>
            <div className="flex flex-col gap-3">
              {productLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-ncx-text-muted hover:text-ncx-text transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <FooterHeading>Resources</FooterHeading>
            <div className="flex flex-col gap-3">
              {resourceLinks.map(link => (
                <FooterExternalLink key={link.label} href={link.href}>
                  {link.label}
                </FooterExternalLink>
              ))}
            </div>
          </div>

          <div>
            <FooterHeading>Community</FooterHeading>
            <div className="flex flex-col gap-3">
              {communityLinks.map(link => (
                <FooterExternalLink key={link.label} href={link.href}>
                  {link.label}
                </FooterExternalLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-ncx-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-ncx-text-subtle text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-ncx-gain" style={{ animation: 'ncx-pulse-dot 2s ease-in-out infinite' }} />
            Live on QF
            <span className="text-ncx-border-strong">·</span>
            NucleusX © {new Date().getFullYear()}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {communityLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full border border-ncx-border text-xs text-ncx-text-muted hover:text-ncx-text hover:border-ncx-purple-500 hover:bg-ncx-wash transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
