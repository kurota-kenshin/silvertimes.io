# SilverTimes Design System

## Design Inspiration

The SilverTimes website is inspired by [Ethena.fi](https://ethena.fi/), featuring a modern, dark-themed design optimized for cryptocurrency and DeFi audiences.

## Color Palette

### Background Colors
- **Primary**: `#0a0a0a` - Main background
- **Secondary**: `#111111` - Card backgrounds
- **Tertiary**: `#1a1a1a` - Hover states

### Silver Colors
- **50**: `#f8f9fa` - Lightest text
- **100**: `#e9ecef` - Light text
- **200**: `#c9cdd1` - Secondary text
- **300-500**: Mid-tone silvers for UI elements
- **600-900**: Dark silvers for depth

### Accent Colors
- **Blue**: `#3b82f6` - Primary accent
- **Cyan**: `#06b6d4` - Secondary accent
- **Purple**: `#8b5cf6` - Tertiary accent

### Gradients
```css
/* Silver Gradient */
linear-gradient(135deg, #c9cdd1 0%, #6c757d 50%, #888e95 100%)

/* Accent Gradient */
linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)

/* Gradient Text Class */
.gradient-text {
  background: linear-gradient(135deg, #c9cdd1 0%, #ffffff 50%, #888e95 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Typography

- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', etc.)
- **Headings**: Bold (700) with tight line-height
- **Body**: Regular (400) with relaxed line-height
- **Antialiasing**: Enabled for smooth rendering

### Type Scale
- **H1**: 5xl-8xl (3rem-6rem) - Hero headlines
- **H2**: 4xl-5xl (2.25rem-3rem) - Section titles
- **H3**: 2xl-3xl (1.5rem-1.875rem) - Card titles
- **Body**: base-xl (1rem-1.25rem) - Standard text
- **Small**: sm-xs (0.875rem-0.75rem) - Labels and captions

## Components

### Cards
- **Background**: `bg-background-secondary`
- **Border**: `border border-white/10`
- **Radius**: `rounded-2xl` (16px)
- **Padding**: `p-8` (2rem)
- **Hover**: `hover:border-white/20 hover:bg-background-tertiary`

### Buttons
**Primary**:
- Background: White
- Text: Black
- Hover: `bg-silver-200`
- Transform: `hover:scale-105`

**Secondary**:
- Border: `border-2 border-white/20`
- Text: White
- Hover: `bg-white/10 border-white/40`

### Navigation
- **Position**: Fixed top with backdrop blur
- **Background**: `bg-background-primary/80 backdrop-blur-lg`
- **Border**: `border-b border-white/10`
- **Height**: 20 (5rem)

### Animations
```javascript
// Pulse Slow
animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'

// Bounce (scroll indicator)
animation: 'bounce'

// Transitions
transition: 'all 0.3s ease'
```

## Layout

### Container
- Max Width: 7xl (80rem / 1280px) for most sections
- Padding: `px-4` (1rem horizontal)
- Margin: `mx-auto` (centered)

### Grid Systems
- **2 columns**: `md:grid-cols-2`
- **3 columns**: `lg:grid-cols-3`
- **4 columns**: `md:grid-cols-4`
- **Gap**: 6-8 (1.5rem-2rem)

### Spacing
- **Section**: `py-32` (8rem vertical)
- **Component**: `mb-16` (4rem margin bottom)
- **Elements**: `gap-4` to `gap-8` (1rem-2rem)

## Effects

### Glow Effects
```html
<div className="absolute w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
```

### Glass Morphism
```html
<div className="bg-background-secondary/50 backdrop-blur-sm border border-white/10"></div>
```

### Hover Transforms
- Scale: `hover:scale-105`
- Rotate: `group-hover:scale-110 transition-transform`
- Color: `hover:text-white transition-colors`

## Accessibility

- **Contrast Ratios**: All text meets WCAG AA standards
- **Focus States**: Visible focus rings on interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Responsive**: Mobile-first, fully responsive design

## Design Principles

1. **Dark First**: Dark theme optimized for reduced eye strain
2. **Minimalist**: Clean design with purposeful whitespace
3. **Modern**: Gradient effects and glass morphism
4. **Trustworthy**: Professional design for financial platform
5. **Performance**: Optimized animations and transitions
6. **Responsive**: Mobile-first, works on all devices

## Icon Usage

Emojis are used for visual interest and quick recognition:
- 🪙 💎 - Token/Currency
- 🏦 🏛️ - Banking/Security
- 📊 📈 - Analytics/Growth
- 🔒 🛡️ - Security/Protection
- ⚡ ⚙️ - Technology/Systems
- ✅ 🔍 - Verification/Transparency

## Responsive Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile: iOS 12+, Android 8+
