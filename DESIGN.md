# SilverTimes Design System

## Design Philosophy

- **Minimal** - Clean, professional, no visual clutter
- **Brand-aligned** - All colors from the SilverTimes Brand Guidelines
- **Guided** - Users always know what to do next
- **NO EMOJIS** - Never use emojis in any UI component. Use styled text or SVG icons only.

## Brand Colors (from BrandGuideline.pdf)

### Primary Colors
- **Brand Sky:** `#90E0EF` - Highlights, top ranks, celebrations
- **Brand Blue:** `#6596FE` - Primary actions, links, selected states, CTA buttons
- **Brand Teal:** `#77D6E3` - Secondary accents, positive indicators, success states

### Dark Backgrounds
- **Primary (Dark):** `#1E1E1E` - Main page background
- **Surface:** `#2B2B2B` - Card backgrounds
- **Tertiary:** `#404040` - Hover states, elevated surfaces

### Greyscale
- `#696969` - Muted text, disabled states
- `#919191` - Secondary text
- `#A8A8A8` - Tertiary text, borders
- `#C4C4C4` - Light text
- `#D9D9D9` - Lightest UI text

### Color Usage Rules
- Maximum 3 accent colors (sky, blue, teal) in any single view
- Use greyscale for all non-accent text and borders
- No emerald, violet, rose, amber, yellow, orange from generic Tailwind palette
- Gradients should be subtle and only use brand colors

### Tailwind Custom Classes
```
brand-sky:     #90E0EF
brand-blue:    #6596FE
brand-teal:    #77D6E3
brand-dark:    #1E1E1E
brand-darker:  #161616
brand-surface: #2B2B2B
```

## Typography

- **Headings:** Bold (700), tight line-height
- **Body:** Regular (400), relaxed line-height
- **Antialiasing:** Enabled for smooth rendering

### Type Scale
- **H1:** 3xl-4xl - Page titles
- **H2:** xl-2xl - Section titles
- **H3:** lg - Card titles
- **Body:** sm-base - Standard text
- **Small:** xs - Labels and captions

## Components

### Cards (matching home page)
```
bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6
```
or with gradient tint:
```
bg-gradient-to-br from-brand-blue/10 to-brand-teal/5 backdrop-blur-md border border-brand-teal/15 rounded-2xl p-8
```
- Use `rounded-2xl` (never `rounded-3xl`)
- Subtle `backdrop-blur-sm` or `backdrop-blur-md`
- `border-white/5` or `border-white/10` for borders

### Buttons
**Primary (CTA):**
```
bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold rounded-lg px-6 py-3
```

**Secondary:**
```
bg-brand-surface border border-silver-700 text-white hover:border-silver-600 rounded-lg px-4 py-2
```

### Tab Navigation
```
Tab bar: border-b border-silver-800
Active tab: text-white border-b-2 border-brand-blue
Inactive tab: text-silver-400 hover:text-white
```

### Rank Badges (NO emojis)
- Rank #1: `bg-brand-sky/20 text-brand-sky font-bold` with text "#1"
- Rank #2: `bg-silver-300/20 text-silver-300 font-bold` with text "#2"
- Rank #3: `bg-silver-500/20 text-silver-400 font-bold` with text "#3"
- Other ranks: plain text

### Navigation
- Fixed top, `bg-[#1E1E1E]/95`
- `border-b border-silver-800`
- Profile avatar button (top-right) when signed in

## Layout Patterns

### Tab-based Pages (Prediction)
```
[Compact Hero Row]
[Tab Bar]
[Tab Content - single panel, no side-by-side columns]
```

### Step-based Flow (Predict tab)
```
Step 1: Connect -> Step 2: Predict -> Step 3: Share
```
- Clear numbered steps
- Only show the current step's content
- Minimal text per step

### Profile Page
```
[Header + user info inline]
[Winnings Hero Card - full width, prominent]
[Current Round + Stats row]
[Prediction History table]
```

## Effects

### Allowed (matching home page style)
- `backdrop-blur-sm` / `backdrop-blur-md` on cards
- Subtle background blur orbs at very low opacity (`bg-brand-blue/5`, `bg-brand-teal/5`)
- Subtle gradient tints on cards (`from-brand-blue/10 to-brand-teal/5`)
- `border border-white/5` or `border-white/10` for card borders
- `rounded-2xl` for main cards
- Gradient CTA buttons (`from-brand-blue to-brand-teal`)
- Gradient accent bars (`bg-gradient-to-b from-brand-blue/60 to-brand-blue/20`)
- Gradient text on hero headings
- Subtle transitions: `transition-colors`, `transition-all`
- Hover color/border changes
- Loading spinners (CSS only)
- Animated pulse dots for live indicators

### NOT Allowed
- Particle animations / confetti / rain celebrations
- Heavy glass morphism (keep it subtle like home page)
- Emojis

## Responsive Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
