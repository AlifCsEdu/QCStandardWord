## 2026-08-09T13:11:56Z

Execute the complete visual and UX overhaul of the QC Standard Wording application into a state-of-the-art 2026 web application inspired by Linear.app, Vercel, and Apple design standards, as specified in the latest prompt in ORIGINAL_REQUEST.md.

Requirements summary:
1. Linear / Vercel 2026 Aesthetic Engine & Typography:
   - Deep Void Midnight background (#050608), Onyx surface containers (#0c0e12), 1px razor-sharp borders (border-white/[0.08] / border-zinc-800), ambient cyan glow highlights (from-cyan-500/20 to-blue-500/10), Geist/Inter + JetBrains Mono fonts.
   - High visual contrast, clear hover states (150ms ease), theme-aware cyan/emerald pill badges.
2. Ultra-Clean Dashboard Layout & Component Refinement:
   - Sticky left sidebar with category Lucide icons, count pills, custom user pin folder manager, collapsible groups.
   - Top header with hero search bar (⌘K / Ctrl+K modal), view switcher (List, Grid Cards, Table), settings.
   - Grid & Table redesigns with glowing hover states and clean action menus.
   - Minimalist floating toasts & glassmorphic side drawer (backdrop-blur-xl bg-zinc-950/85).
3. Performance & Build Integrity:
   - Zero layout shift, instant search responsiveness, TypeScript safety, clean Cloudflare Pages build (`npm run build` and `npm run test` pass with 100% success rate).
