import { Link } from "react-router-dom";
import { Grain } from "./v2/cinematic";

const productLinks = [{ label: "How It Works", to: "/docs" }];

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Documentation", to: "/docs" },
  { label: "Transparency", to: "/transparency" },
];

export default function FooterV2() {
  return (
    <footer className="relative overflow-hidden bg-black px-6 pb-10 pt-20 sm:px-10 lg:px-16">
      <Grain />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/[0.06] blur-[150px]" />
      {/* Top gradient hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <img src="/ST_LOGO_DARK@2x.png" alt="SilverTimes" className="h-7" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-silver-300">
              1:1 Backed. Fully Transparent. Real Silver.
            </p>

            <div className="mt-7 flex gap-3">
              <a
                href="https://x.com/SilvertimesSTT"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-silver-400 transition-all hover:border-brand-teal/40 hover:bg-brand-blue/10 hover:text-brand-sky"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://t.me/SilverTimesToken"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-silver-400 transition-all hover:border-brand-teal/40 hover:bg-brand-blue/10 hover:text-brand-sky"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.359 5.358-.168.56-.5.748-.82.767-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.1-.002.322.023.466.14.122.1.155.235.171.33.016.095.036.311.02.48z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-silver-500">
              Product
            </h4>
            <ul className="space-y-3.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-silver-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-silver-500">
              Company
            </h4>
            <ul className="space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-silver-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:marketing@silvertimes.io"
                  className="text-sm text-silver-400 transition-colors hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-silver-600">© 2026 SilverTimes. All rights reserved.</p>
          <div className="flex gap-7 text-xs text-silver-500">
            <Link to="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
