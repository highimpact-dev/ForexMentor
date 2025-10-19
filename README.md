# ForexMentor AI

**Stop Trading on Emotion. Start Trading with a Plan.**

ForexMentor AI is a psychology-focused forex paper trading platform that combines AI-powered trade analysis with social accountability features. Unlike traditional demo accounts that offer zero feedback, ForexMentor AI addresses the core reason 85% of traders fail: emotions and isolation.

## 🎯 Vision

The only beginner trading platform that addresses **WHY** 85% fail (emotions + isolation), not just **HOW** to trade.

**The Winning Formula:**
Paper trading + AI coaching + social accountability + psychological training = A platform that helps beginners build the discipline and emotional control to succeed.

## ✨ Key Features

### 🧠 AI Psychology Coach
- **Pre-Trade Readiness Score**: AI analyzes your emotional state, win/loss streak, and recent behavior to give you a 0-100 readiness score before every trade
- **Emotional Pattern Recognition**: Identifies patterns like "You lose 80% of trades on Fridays when you log 'Frustrated'"
- **Trade Blocking**: Prevents revenge trading and impulsive decisions by blocking trades when your psychological state is compromised
- **Post-Trade Analysis**: Instant AI-powered feedback on every closed trade with actionable improvement tips

### 👥 Social Accountability System (Post-MVP)
- **Accountability Partners**: 1-on-1 matching with traders in your timezone for mutual support and goal-setting
- **Trading Challenges**: Weekly competitions focused on discipline and risk management (not just profit)
- **Public Trade Feed**: Optional sharing of trades with community learning and feedback
- **Study Groups**: Small groups for collaborative learning and trade review

### 📊 Smart Paper Trading
- Practice with $10,000 virtual balance on major Forex pairs
- Real-time trade execution with realistic spreads
- Intelligent risk management guidance and position sizing
- Required stop-loss for all trades (protecting beginners from themselves)
- Risk:Reward ratio analysis with color-coded warnings

### 📓 Psychology Training (Post-MVP)
- Pre-trade emotional check-ins (3 simple questions)
- Post-trade emotional logging
- Psychology training modules on FOMO, revenge trading, emotional discipline
- Mindfulness exercises and breathing techniques
- Discipline score tracking and gamification

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Convex account
- Clerk account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/forexmentor.git
cd forexmentor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer
```

### Development

Start both the frontend and backend in parallel:

```bash
npm run dev
```

This runs:
- `next dev` - Next.js development server (localhost:3000)
- `convex dev` - Convex backend with real-time sync

Or run them separately:

```bash
npm run dev:frontend  # Next.js only
npm run dev:backend   # Convex only
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📁 Project Structure

```
/app                    # Next.js App Router pages
  /(auth)              # Authentication routes (sign-in, sign-up)
  /(dashboard)         # Protected dashboard routes
  layout.tsx           # Root layout with providers
  page.tsx             # Landing page

/components            # React components
  /ui                  # shadcn/ui components
  mode-toggle.tsx      # Dark/light mode toggle

/convex                # Convex backend functions
  /_generated          # Auto-generated types and API
  auth.config.ts       # Clerk authentication config
  myFunctions.ts       # Sample Convex functions
  schema.ts            # Database schema

/providers             # React context providers
  ConvexClientProvider.tsx  # Convex + Clerk integration
  theme-provider.tsx        # Theme provider

/lib                   # Utility functions
  utils.ts             # Tailwind class merging helper

middleware.ts          # Route protection logic
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Convex (serverless backend with real-time database)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Themes**: next-themes for dark/light mode
- **AI**: OpenAI GPT-4 (via Vercel AI SDK) - Coming in MVP
- **Market Data**: Polygon.io Forex API - Coming in MVP

## 🎓 Key Concepts

### Convex Backend

This project uses Convex for the backend. Key patterns:

- **Function Syntax**: Always use new syntax with `args`, `returns`, and `handler`
- **Validators**: Every function must have validators for arguments and return values
- **File-based Routing**: Functions in `convex/example.ts` are accessed via `api.example.functionName`
- **Public vs Internal**: Use `query`/`mutation`/`action` for public API, `internalQuery`/`internalMutation`/`internalAction` for private functions

See `.cursor/rules/convex_rules.mdc` for complete guidelines.

### Authentication Flow

- Unauthenticated users accessing `/dashboard` or `/server` → redirected to `/sign-in`
- Authenticated users accessing `/sign-in` or `/sign-up` → redirected to `/dashboard`
- Root page `/` is publicly accessible

### Provider Chain

The app wraps components in this order:
```
ClerkProvider → ConvexClientProvider → ThemeProvider → children
```

## 📈 Development Roadmap

### ✅ Phase 0: Foundation (Complete)
- Next.js + Convex + Clerk setup
- Authentication and route protection
- Dashboard layout with dark mode
- Basic UI component library

### 🏗️ Phase 1: MVP (Weeks 1-4) - In Progress
- Paper trading simulator
- Real-time price data integration
- Trade execution and P&L tracking
- AI trade analysis (GPT-4)
- Pre-trade psychology check
- Risk management guidance

### 📓 Phase 2: Psychology Core (Weeks 5-8)
- Pre-trade emotional check (3 questions)
- Post-trade emotional logging
- AI pattern recognition
- Psychology training modules
- Discipline score tracking
- Trade blocking for revenge trading

### 👥 Phase 3: Social Features (Weeks 9-12)
- Accountability partner matching
- Trading challenges and leaderboards
- Public trade feed
- Direct messaging
- Study groups

### 🎓 Phase 4: Learning System (Month 4)
- Course catalog
- Psychology training modules
- Interactive quizzes
- Progress tracking

### 💰 Phase 5: Monetization (Month 5+)
- Stripe integration
- Subscription tiers
- Feature gating
- Billing portal

## 💎 Subscription Tiers (Planned)

### Free Tier: "Bronze Trader"
- 25 trades/month
- Basic AI trade evaluation
- Basic psychology logging
- Public trade feed access (view only)
- Community Discord access

### $29/month: "Silver Trader"
- Unlimited trades
- Full AI coaching
- Pre-trade psychology checks
- Weekly AI psychology report
- 1 accountability partner
- Join trading challenges
- Share trades publicly

### $49/month: "Gold Trader"
- Everything in Silver
- AI psychology coach chat
- Up to 3 accountability partners
- Create private study group
- Advanced psychology modules
- Monthly live group workshops
- Priority support

### $99/month: "Platinum Trader"
- Everything in Gold
- 1-on-1 weekly psychology coaching
- Custom trading plan
- Lead accountability groups
- Early access to features

## 🎯 Success Metrics

### MVP Launch (30 Days)
- 100 user signups
- 50 active traders (3+ trades)
- 200+ trades executed
- 4+ star average AI analysis rating
- 70%+ retention within 7 days

### 12 Months
- 2,500 free users
- 150 paid customers
- $4,800 MRR ($57.6k ARR)
- 6% conversion rate

## 🤝 Contributing

This is currently a private project in development. Contributions will be welcome after the initial MVP launch.

## 📄 License

Proprietary - All rights reserved

## 🔗 Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

For inquiries: [Your Contact Information]

---

**Built with ❤️ to help traders master their psychology and build lasting discipline.**
