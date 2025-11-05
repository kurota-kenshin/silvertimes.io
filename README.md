# SilverTimes

A modern static website for SilverTimes - a yield-bearing silver token platform backed by real assets from a reputable Hong Kong listed company.

## Overview

SilverTimes is the only silver token that combines:
- Real physical backing by a HK listed company
- Full redeemability for physical silver
- Yield-bearing staking mechanisms

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
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

## Project Structure

```
src/
├── components/
│   ├── Hero.tsx           # Landing hero section
│   ├── USPs.tsx           # Unique selling propositions
│   ├── AboutSilver.tsx    # About silver tokens
│   ├── TargetAudience.tsx # Target personas
│   ├── HowItWorks.tsx     # Platform explanation
│   ├── FAQ.tsx            # Frequently asked questions
│   └── Footer.tsx         # Footer with links
├── App.tsx                # Main app component
├── main.tsx              # Entry point
└── index.css             # Global styles
```
