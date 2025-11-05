# SilverTimes

A modern, dark-themed static website for SilverTimes - tokenised silver with treasury-powered yield. Built with React, TypeScript, and inspired by Ethena's sleek design.

## Overview

**"Tokenised silver with treasury-powered yield"**

SilverTimes is the only silver token that combines:
- Real physical backing by a HK listed company (50% physical silver, 5-10% cash, 40-45% futures)
- Full redeemability for LBMA Good Delivery bars
- Yield-bearing staking mechanisms (2-8% target APY)
- 0% storage fees, 0.35% redemption fee

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 (Ethena-inspired dark theme)
- **Deployment**: AWS S3 (static site)

## Development

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to AWS S3.

Quick deploy:
```bash
npm run build
aws s3 sync dist/ s3://silvertimes.io --delete
```

## Target Audience

- Commodity traders (25-50 yo, tech-savvy)
- Safe haven seekers looking for portfolio diversification
- Institutional investors
- Existing silver holders
- DeFi investors

## Key Features

- Backed by reputable HK listed company
- Tokenized traditional safe haven asset
- Yield-bearing through staking
- Lower storage costs vs physical silver
- Fast wallet-to-wallet settlement
- Fully redeemable for physical silver

## Design Features

- **Dark Theme**: Ethena-inspired design with `#0a0a0a` background
- **Gradient Text**: Silver gradient effects for emphasis
- **Animated Backgrounds**: Subtle glow effects and animations
- **Responsive Layout**: Mobile-first, fully responsive design
- **Glass Morphism**: Backdrop blur and semi-transparent cards
- **Smooth Transitions**: Hover effects and color transitions throughout

## Project Structure

```
src/
├── components/
│   ├── Navigation.tsx     # Fixed navigation header with stats
│   ├── HeroNew.tsx        # Hero with animated background & CTA
│   ├── TokenBacking.tsx   # 50/5-10/40-45 backing breakdown
│   ├── MarketGraph.tsx    # Supply vs Demand visualization
│   ├── FeatureCards.tsx   # 5 key features + CTA card
│   ├── Tokenomics.tsx     # Token specs, fees, audits
│   ├── HowItWorksNew.tsx  # 6-step process timeline
│   └── Footer.tsx         # Dark footer with social links
├── App.tsx                # Main app component
├── main.tsx              # Entry point
└── index.css             # Global styles with gradient-text
```

## Content Sections

1. **Hero**: "Tokenised silver with treasury-powered yield"
2. **Token Backing**: Visual breakdown of reserve allocation
3. **Market Analysis**: Supply/demand deficit trend chart
4. **Feature Cards**: Earn while holding, on-chain distribution, risk-managed yield, no storage fees, 24/7 liquidity
5. **Tokenomics**: $STT specs, storage (Brinks/Horsemart), fees, audits
6. **How It Works**: KYC → Reserves → Price Tracking → Earn → Redeem → Security
