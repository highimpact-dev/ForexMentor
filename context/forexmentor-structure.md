# ForexMentor AI - Complete File Structure (MVP + Future Features)

## Full Directory Structure (MVP + Community + LMS)

```
forexmentor-ai/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── app/
│   ├── (auth)/                          # Route group for auth pages
│   │   ├── layout.tsx                   # Auth layout (centered, no nav)
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                     # Route group for authenticated pages
│   │   ├── layout.tsx                   # Dashboard layout (with nav/sidebar)
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Main dashboard
│   │   ├── chart/
│   │   │   └── page.tsx                 # Trading chart
│   │   ├── trades/
│   │   │   ├── page.tsx                 # Trade history
│   │   │   └── [id]/
│   │   │       └── page.tsx             # Individual trade details + AI analysis
│   │   ├── analytics/
│   │   │   └── page.tsx                 # Performance analytics
│   │   │
│   │   ├── journal/                     # 📓 POST-MVP: Trading Journal
│   │   │   ├── page.tsx                 # Journal home (all entries)
│   │   │   ├── new/
│   │   │   │   └── page.tsx             # Create new journal entry
│   │   │   └── [id]/
│   │   │       ├── page.tsx             # View/edit journal entry
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── community/                   # 👥 POST-MVP: Social Features
│   │   │   ├── page.tsx                 # Community hub/feed
│   │   │   ├── feed/
│   │   │   │   └── page.tsx             # Public trade feed
│   │   │   ├── challenges/
│   │   │   │   ├── page.tsx             # Active challenges list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Challenge details + leaderboard
│   │   │   ├── partners/
│   │   │   │   ├── page.tsx             # Find accountability partners
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Partner profile
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx             # Message inbox
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx         # Chat thread
│   │   │   └── groups/
│   │   │       ├── page.tsx             # Study groups list
│   │   │       ├── new/
│   │   │       │   └── page.tsx         # Create study group
│   │   │       └── [id]/
│   │   │           └── page.tsx         # Group details + discussion
│   │   │
│   │   ├── learn/                       # 🎓 POST-MVP: Learning Management System
│   │   │   ├── page.tsx                 # Learning hub (course catalog)
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx             # All courses
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx         # Course overview
│   │   │   │       └── lessons/
│   │   │   │           └── [lessonId]/
│   │   │   │               └── page.tsx # Lesson content
│   │   │   ├── psychology/
│   │   │   │   ├── page.tsx             # Psychology training hub
│   │   │   │   └── modules/
│   │   │   │       └── [moduleId]/
│   │   │   │           └── page.tsx     # Psychology module
│   │   │   ├── quizzes/
│   │   │   │   └── [quizId]/
│   │   │   │       ├── page.tsx         # Take quiz
│   │   │   │       └── results/
│   │   │   │           └── page.tsx     # Quiz results
│   │   │   └── progress/
│   │   │       └── page.tsx             # Learning progress tracker
│   │   │
│   │   └── settings/
│   │       ├── page.tsx                 # Account settings
│   │       ├── profile/
│   │       │   └── page.tsx             # Public profile settings
│   │       ├── notifications/
│   │       │   └── page.tsx             # Notification preferences
│   │       ├── privacy/
│   │       │   └── page.tsx             # Privacy settings
│   │       └── billing/                 # 💰 POST-MVP: Subscription management
│   │           └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts             # BetterAuth API routes
│   │   │
│   │   ├── inngest/
│   │   │   └── route.ts                 # Inngest webhook endpoint
│   │   │
│   │   ├── prices/
│   │   │   ├── current/
│   │   │   │   └── route.ts             # GET current prices
│   │   │   └── historical/
│   │   │       └── route.ts             # GET historical candles
│   │   │
│   │   ├── stripe/                      # 💰 POST-MVP: Payment webhooks
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   │
│   │   ├── notifications/               # 🔔 POST-MVP: Push notifications
│   │   │   └── subscribe/
│   │   │       └── route.ts
│   │   │
│   │   └── webhooks/
│   │       └── polygon/
│   │           └── route.ts             # Polygon.io webhooks
│   │
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Landing page
│   ├── pricing/                         # 💰 POST-MVP: Pricing page
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── globals.css
│   └── providers.tsx                    # Client-side providers wrapper
│
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── GoogleSignInButton.tsx
│   │   └── PasswordResetForm.tsx
│   │
│   ├── dashboard/
│   │   ├── AccountSummary.tsx
│   │   ├── OpenPositions.tsx
│   │   ├── RecentTrades.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── QuickStats.tsx
│   │
│   ├── trade/
│   │   ├── TradeEntryModal.tsx          # Main trade entry modal
│   │   ├── RiskCalculator.tsx           # Smart risk calculator
│   │   ├── RiskRewardIndicator.tsx      # R:R visual indicator
│   │   ├── TradeSummaryPanel.tsx        # Pre-trade summary
│   │   ├── WarningSystem.tsx            # Warning display component
│   │   ├── PsychologyCheck.tsx          # Pre-flight psychology check
│   │   ├── PositionSizeCalculator.tsx   # Position size logic
│   │   └── EducationalTooltip.tsx       # Inline help tooltips
│   │
│   ├── analysis/
│   │   ├── AIAnalysisModal.tsx          # AI analysis display
│   │   ├── ScoreDisplay.tsx             # Star rating component
│   │   ├── FeedbackSection.tsx          # Analysis feedback display
│   │   ├── ImprovementTips.tsx          # Tips list component
│   │   └── AnalysisRating.tsx           # User rating component
│   │
│   ├── journal/                         # 📓 POST-MVP: Journal components
│   │   ├── JournalEntry.tsx             # Single journal entry card
│   │   ├── JournalEditor.tsx            # Rich text editor for entries
│   │   ├── JournalFilters.tsx           # Filter by date, pair, tags
│   │   ├── TagManager.tsx               # Manage entry tags
│   │   └── EmotionTracker.tsx           # Track emotional state
│   │
│   ├── community/                       # 👥 POST-MVP: Community components
│   │   ├── feed/
│   │   │   ├── TradeFeedItem.tsx        # Single trade post in feed
│   │   │   ├── FeedFilters.tsx          # Filter feed by criteria
│   │   │   ├── CommentSection.tsx       # Comments on trade posts
│   │   │   └── LikeButton.tsx           # Like/react to posts
│   │   ├── challenges/
│   │   │   ├── ChallengeCard.tsx        # Challenge preview card
│   │   │   ├── ChallengeLeaderboard.tsx # Leaderboard component
│   │   │   ├── ChallengeProgress.tsx    # User's challenge progress
│   │   │   └── JoinChallengeButton.tsx
│   │   ├── partners/
│   │   │   ├── PartnerCard.tsx          # Partner profile card
│   │   │   ├── PartnerMatchmaker.tsx    # Matching algorithm UI
│   │   │   ├── PartnerStats.tsx         # Shared stats comparison
│   │   │   └── PartnerRequest.tsx       # Send/accept partner requests
│   │   ├── messaging/
│   │   │   ├── ChatInterface.tsx        # Real-time chat UI
│   │   │   ├── MessageBubble.tsx        # Single message
│   │   │   ├── ConversationList.tsx     # List of conversations
│   │   │   └── OnlineStatus.tsx         # User online indicator
│   │   └── groups/
│   │       ├── GroupCard.tsx            # Study group card
│   │       ├── GroupDiscussion.tsx      # Group discussion board
│   │       ├── GroupMembers.tsx         # Member list
│   │       └── CreateGroupForm.tsx
│   │
│   ├── learn/                           # 🎓 POST-MVP: LMS components
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx           # Course preview card
│   │   │   ├── CourseProgress.tsx       # Progress bar/tracker
│   │   │   ├── LessonList.tsx           # List of lessons in course
│   │   │   ├── LessonContent.tsx        # Lesson video/text content
│   │   │   ├── LessonNavigation.tsx     # Previous/Next lesson
│   │   │   └── CertificateDisplay.tsx   # Course completion certificate
│   │   ├── psychology/
│   │   │   ├── PsychologyModule.tsx     # Psychology training module
│   │   │   ├── ReflectionPrompt.tsx     # Reflection questions
│   │   │   ├── MindfulnessExercise.tsx  # Guided exercises
│   │   │   └── TriggerTracker.tsx       # Identify trading triggers
│   │   ├── quizzes/
│   │   │   ├── QuizQuestion.tsx         # Single quiz question
│   │   │   ├── QuizResults.tsx          # Quiz score/feedback
│   │   │   ├── MultipleChoice.tsx       # MC question type
│   │   │   └── TrueFalse.tsx            # T/F question type
│   │   └── ProgressDashboard.tsx        # Overall learning progress
│   │
│   ├── charts/
│   │   ├── PriceChart.tsx               # TradingView chart
│   │   ├── BalanceChart.tsx             # Account balance over time
│   │   └── chart-config.ts
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Footer.tsx
│   │   └── NotificationBell.tsx         # 🔔 POST-MVP: Notification icon
│   │
│   ├── ui/                              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── tooltip.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── separator.tsx
│   │   └── progress.tsx
│   │
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       ├── ConfirmDialog.tsx
│       ├── SearchInput.tsx              # 👥 POST-MVP: Global search
│       └── UserAvatar.tsx               # 👥 POST-MVP: User profile pic
│
├── convex/
│   ├── _generated/                      # Auto-generated by Convex
│   │   ├── api.d.ts
│   │   ├── api.js
│   │   └── server.d.ts
│   │
│   ├── schema.ts                        # Database schema (all tables)
│   │
│   ├── users.ts                         # User queries & mutations
│   ├── trades.ts                        # Trade queries & mutations
│   ├── analyses.ts                      # Analysis queries & mutations
│   ├── priceData.ts                     # Price data queries
│   │
│   ├── journal.ts                       # 📓 POST-MVP: Journal entries
│   ├── journalTags.ts                   # 📓 POST-MVP: Journal tags
│   │
│   ├── community/                       # 👥 POST-MVP: Community data
│   │   ├── feed.ts                      # Public trade feed
│   │   ├── challenges.ts                # Challenge system
│   │   ├── partners.ts                  # Accountability partners
│   │   ├── messages.ts                  # Direct messaging
│   │   ├── groups.ts                    # Study groups
│   │   ├── comments.ts                  # Comments on posts
│   │   └── reactions.ts                 # Likes/reactions
│   │
│   ├── learn/                           # 🎓 POST-MVP: LMS data
│   │   ├── courses.ts                   # Course catalog
│   │   ├── lessons.ts                   # Lesson content
│   │   ├── progress.ts                  # User progress tracking
│   │   ├── quizzes.ts                   # Quiz questions/results
│   │   ├── psychology.ts                # Psychology modules
│   │   └── certificates.ts              # Course certificates
│   │
│   ├── subscriptions.ts                 # 💰 POST-MVP: Stripe subscriptions
│   ├── notifications.ts                 # 🔔 POST-MVP: In-app notifications
│   │
│   └── http.ts                          # Convex HTTP actions (for Inngest)
│
├── inngest/
│   ├── client.ts                        # Inngest client setup
│   ├── functions/
│   │   ├── analyze-trade.ts             # AI trade analysis function
│   │   ├── update-prices.ts             # Price update function
│   │   ├── monthly-reset.ts             # Monthly trade limit reset
│   │   │
│   │   ├── challenge-checker.ts         # 👥 POST-MVP: Check challenge completion
│   │   ├── send-notifications.ts        # 🔔 POST-MVP: Notification delivery
│   │   ├── match-partners.ts            # 👥 POST-MVP: Partner matching algorithm
│   │   ├── generate-certificate.ts      # 🎓 POST-MVP: Course completion cert
│   │   └── subscription-manager.ts      # 💰 POST-MVP: Subscription lifecycle
│   │
│   └── types.ts                         # Inngest event types
│
├── lib/
│   ├── auth/
│   │   ├── better-auth.ts               # BetterAuth configuration
│   │   ├── auth-client.ts               # Client-side auth helpers
│   │   └── session.ts                   # Session management
│   │
│   ├── ai/
│   │   ├── prompts.ts                   # AI prompt templates
│   │   ├── analysis-schema.ts           # Zod schemas for AI output
│   │   ├── claude-client.ts             # Vercel AI SDK setup
│   │   └── chat-coach.ts                # 💰 POST-MVP: AI coaching chat
│   │
│   ├── api/
│   │   ├── polygon.ts                   # Polygon.io API client
│   │   ├── resend.ts                    # Email API client
│   │   ├── stripe.ts                    # 💰 POST-MVP: Stripe client
│   │   └── pusher.ts                    # 👥 POST-MVP: Real-time messaging
│   │
│   ├── calculations/
│   │   ├── pnl.ts                       # P&L calculations
│   │   ├── position-size.ts             # Position sizing logic
│   │   ├── margin.ts                    # Margin calculations
│   │   ├── risk-reward.ts               # R:R ratio calculations
│   │   └── pip-value.ts                 # Pip value calculations
│   │
│   ├── indicators/
│   │   ├── index.ts                     # Main indicators calculator
│   │   ├── rsi.ts                       # RSI calculation
│   │   ├── macd.ts                      # MACD calculation
│   │   ├── ema.ts                       # EMA calculation
│   │   └── support-resistance.ts        # S/R detection
│   │
│   ├── validation/
│   │   ├── trade-validation.ts          # Trade validation logic
│   │   ├── risk-validation.ts           # Risk management validation
│   │   └── psychology-scoring.ts        # Psychology check scoring
│   │
│   ├── community/                       # 👥 POST-MVP: Community logic
│   │   ├── matching-algorithm.ts        # Partner matching logic
│   │   ├── challenge-scoring.ts         # Challenge points calculation
│   │   ├── feed-ranking.ts              # Feed post ranking algorithm
│   │   └── moderation.ts                # Content moderation helpers
│   │
│   ├── learn/                           # 🎓 POST-MVP: LMS logic
│   │   ├── progress-calculator.ts       # Calculate course completion %
│   │   ├── quiz-grading.ts              # Grade quiz attempts
│   │   ├── recommendation.ts            # Recommend next courses
│   │   └── certificate-generator.ts     # Generate PDF certificates
│   │
│   ├── utils/
│   │   ├── cn.ts                        # Class name utility
│   │   ├── format.ts                    # Number/date formatting
│   │   ├── constants.ts                 # App constants
│   │   ├── helpers.ts                   # General helpers
│   │   └── seo.ts                       # SEO metadata helpers
│   │
│   ├── hooks/
│   │   ├── use-current-user.ts
│   │   ├── use-open-trades.ts
│   │   ├── use-price-updates.ts
│   │   ├── use-trade-form.ts
│   │   ├── use-toast.ts
│   │   │
│   │   ├── use-messages.ts              # 👥 POST-MVP: Real-time messaging
│   │   ├── use-notifications.ts         # 🔔 POST-MVP: Notifications
│   │   ├── use-course-progress.ts       # 🎓 POST-MVP: Track course progress
│   │   └── use-subscription.ts          # 💰 POST-MVP: Subscription status
│   │
│   ├── types/
│   │   ├── trade.ts                     # Trade types
│   │   ├── user.ts                      # User types
│   │   ├── analysis.ts                  # Analysis types
│   │   ├── api.ts                       # API response types
│   │   │
│   │   ├── journal.ts                   # 📓 POST-MVP: Journal types
│   │   ├── community.ts                 # 👥 POST-MVP: Community types
│   │   ├── course.ts                    # 🎓 POST-MVP: Course types
│   │   └── subscription.ts              # 💰 POST-MVP: Subscription types
│   │
│   └── convex-client.ts                 # Convex client setup
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero.png
│   │   ├── courses/                     # 🎓 POST-MVP: Course thumbnails
│   │   └── achievements/                # 👥 POST-MVP: Badge images
│   ├── icons/
│   ├── videos/                          # 🎓 POST-MVP: Tutorial videos
│   └── favicon.ico
│
├── tests/
│   ├── unit/
│   │   ├── calculations.test.ts
│   │   ├── indicators.test.ts
│   │   ├── validation.test.ts
│   │   ├── matching.test.ts             # 👥 POST-MVP: Partner matching
│   │   └── grading.test.ts              # 🎓 POST-MVP: Quiz grading
│   │
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── trading.test.ts
│   │   ├── ai-analysis.test.ts
│   │   ├── messaging.test.ts            # 👥 POST-MVP: Chat system
│   │   └── subscriptions.test.ts        # 💰 POST-MVP: Stripe integration
│   │
│   ├── e2e/
│   │   ├── auth-flow.spec.ts
│   │   ├── trade-flow.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── journal-flow.spec.ts         # 📓 POST-MVP
│   │   ├── community-flow.spec.ts       # 👥 POST-MVP
│   │   └── course-flow.spec.ts          # 🎓 POST-MVP
│   │
│   └── setup.ts
│
├── .env.local                           # Local environment variables
├── .env.example                         # Example env file
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── vitest.config.ts                     # Vitest configuration
├── playwright.config.ts                 # Playwright configuration
├── components.json                      # shadcn/ui config
└── README.md
```

## Feature Roadmap & File Organization

### ✅ **Phase 1: MVP (Weeks 1-4)**

Core files needed:

- `app/(auth)/`, `app/(dashboard)/dashboard`, `app/(dashboard)/trades`
- `components/{auth,dashboard,trade,analysis}`
- `convex/{users,trades,analyses,priceData}.ts`
- `lib/{auth,ai,calculations,indicators,validation}`

### 📓 **Phase 2: Trading Journal (Month 2)**

New files to add:

- `app/(dashboard)/journal/`
- `components/journal/`
- `convex/journal.ts`, `convex/journalTags.ts`
- `lib/types/journal.ts`

Journal Features:

- Rich text entry editor
- Emotional state tracking
- Tag/filter system
- Review past trades with notes
- Identify patterns in behavior

### 👥 **Phase 3: Community Features (Month 3)**

New files to add:

- `app/(dashboard)/community/`
- `components/community/`
- `convex/community/{feed,challenges,partners,messages,groups}.ts`
- `lib/community/`, `lib/api/pusher.ts`
- `lib/types/community.ts`

Community Features:

- Public trade feed (opt-in sharing)
- Weekly challenges with leaderboards
- Accountability partner matching
- Direct messaging
- Study groups for traders
- Like/comment on trades

### 🎓 **Phase 4: Learning Management System (Month 4)**

New files to add:

- `app/(dashboard)/learn/`
- `components/learn/`
- `convex/learn/{courses,lessons,progress,quizzes}.ts`
- `lib/learn/`, `lib/types/course.ts`
- `public/videos/`

LMS Features:

- Course catalog (Forex basics, Technical Analysis, Risk Management)
- Video lessons with progress tracking
- Interactive quizzes
- Psychology training modules
- Course completion certificates
- Personalized learning paths

### 💰 **Phase 5: Monetization (Month 5)**

New files to add:

- `app/pricing/`, `app/(dashboard)/settings/billing/`
- `convex/subscriptions.ts`
- `lib/api/stripe.ts`
- `inngest/functions/subscription-manager.ts`
- `lib/types/subscription.ts`

Subscription Tiers:

- **Free:** 25 trades/month, basic AI analysis
- **Starter ($29/mo):** Unlimited trades, journal, basic courses
- **Pro ($49/mo):** AI coach chat, advanced courses, study groups
- **Elite ($99/mo):** 1-on-1 coaching, psychology training, priority support

## Extended Database Schema (Convex)

### Post-MVP Tables to Add

```typescript
// convex/schema.ts (additions)

// 📓 Journal
journalEntries: defineTable({
  userId: v.id("users"),
  tradeId: v.optional(v.id("trades")),
  title: v.string(),
  content: v.string(), // Rich text/markdown
  emotionalState: v.union(
    v.literal("confident"),
    v.literal("anxious"),
    v.literal("greedy"),
    v.literal("fearful"),
    v.literal("neutral")
  ),
  tags: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_trade", ["tradeId"]),

// 👥 Community - Feed
tradePosts: defineTable({
  userId: v.id("users"),
  tradeId: v.id("trades"),
  caption: v.string(),
  isPublic: v.boolean(),
  likesCount: v.number(),
  commentsCount: v.number(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_public", ["isPublic", "createdAt"]),

// 👥 Community - Challenges
challenges: defineTable({
  title: v.string(),
  description: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  rules: v.object({
    minTrades: v.number(),
    maxRiskPercent: v.number(),
    targetWinRate: v.optional(v.number()),
  }),
  status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("completed")),
  participantCount: v.number(),
})
  .index("by_status", ["status"]),

challengeParticipants: defineTable({
  challengeId: v.id("challenges"),
  userId: v.id("users"),
  score: v.number(),
  tradesCompleted: v.number(),
  rank: v.optional(v.number()),
  joinedAt: v.number(),
})
  .index("by_challenge", ["challengeId"])
  .index("by_challenge_score", ["challengeId", "score"]),

// 👥 Community - Partners
partnerships: defineTable({
  user1Id: v.id("users"),
  user2Id: v.id("users"),
  status: v.union(v.literal("pending"), v.literal("active"), v.literal("ended")),
  sharedGoal: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_user1", ["user1Id"])
  .index("by_user2", ["user2Id"])
  .index("by_status", ["status"]),

// 👥 Community - Messaging
conversations: defineTable({
  participantIds: v.array(v.id("users")),
  lastMessageAt: v.number(),
  lastMessage: v.string(),
})
  .index("by_participant", ["participantIds"]),

messages: defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  content: v.string(),
  readBy: v.array(v.id("users")),
  createdAt: v.number(),
})
  .index("by_conversation", ["conversationId", "createdAt"]),

// 👥 Community - Groups
studyGroups: defineTable({
  name: v.string(),
  description: v.string(),
  creatorId: v.id("users"),
  memberIds: v.array(v.id("users")),
  maxMembers: v.number(),
  isPrivate: v.boolean(),
  createdAt: v.number(),
})
  .index("by_creator", ["creatorId"])
  .index("by_visibility", ["isPrivate"]),

// 🎓 LMS - Courses
courses: defineTable({
  title: v.string(),
  description: v.string(),
  thumbnailUrl: v.string(),
  difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
  estimatedMinutes: v.number(),
  lessonCount: v.number(),
  prerequisiteCourseIds: v.array(v.id("courses")),
  tier: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("elite")),
  order: v.number(),
  isPublished: v.boolean(),
})
  .index("by_difficulty", ["difficulty"])
  .index("by_tier", ["tier"]),

lessons: defineTable({
  courseId: v.id("courses"),
  title: v.string(),
  content: v.string(), // Markdown/rich text
  videoUrl: v.optional(v.string()),
  duration: v.number(),
  order: v.number(),
  type: v.union(v.literal("video"), v.literal("reading"), v.literal("quiz")),
})
  .index("by_course", ["courseId", "order"]),

courseProgress: defineTable({
  userId: v.id("users"),
  courseId: v.id("courses"),
  completedLessonIds: v.array(v.id("lessons")),
  currentLessonId: v.optional(v.id("lessons")),
  percentComplete: v.number(),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_user_course", ["userId", "courseId"]),

quizzes: defineTable({
  lessonId: v.id("lessons"),
  questions: v.array(v.object({
    question: v.string(),
    type: v.union(v.literal("multiple_choice"), v.literal("true_false")),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.string(),
  })),
  passingScore: v.number(),
})
  .index("by_lesson", ["lessonId"]),

quizAttempts: defineTable({
  userId: v.id("users"),
  quizId: v.id("quizzes"),
  score: v.number(),
  answers: v.array(v.string()),
  passed: v.boolean(),
  completedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_quiz", ["quizId"]),

// 💰 Subscriptions
subscriptions: defineTable({
  userId: v.id("users"),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.string(),
  tier: v.union(v.literal("free"), v.literal("starter"), v.literal("pro"), v.literal("elite")),
  status: v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due")),
  currentPeriodEnd: v.number(),
  cancelAtPeriodEnd: v.boolean(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_stripe_customer", ["stripeCustomerId"]),

// 🔔 Notifications
notifications: defineTable({
  userId: v.id("users"),
  type: v.union(
    v.literal("trade_analysis_ready"),
    v.literal("challenge_completed"),
    v.literal("partner_request"),
    v.literal("new_message"),
    v.literal("course_completed")
  ),
  title: v.string(),
  message: v.string(),
  actionUrl: v.optional(v.string()),
  isRead: v.boolean(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_unread", ["userId", "isRead"]),
```

## Migration Strategy

### Adding New Features Without Breaking Existing Code

1. **Use Feature Flags:**

```typescript
// lib/utils/features.ts
export const FEATURES = {
  JOURNAL: process.env.NEXT_PUBLIC_FEATURE_JOURNAL === 'true',
  COMMUNITY: process.env.NEXT_PUBLIC_FEATURE_COMMUNITY === 'true',
  COURSES: process.env.NEXT_PUBLIC_FEATURE_COURSES === 'true',
  SUBSCRIPTIONS: process.env.NEXT_PUBLIC_FEATURE_SUBSCRIPTIONS === 'true',
};

// Usage in components
import { FEATURES } from '@/lib/utils/features';

export function Navbar() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/trades">Trades</Link>
      {FEATURES.JOURNAL && <Link href="/journal">Journal</Link>}
      {FEATURES.COMMUNITY && <Link href="/community">Community</Link>}
      {FEATURES.COURSES && <Link href="/learn">Learn</Link>}
    </nav>
  );
}
```

1. **Gradual Schema Evolution:**

- Add new tables incrementally
- Don't modify existing tables initially
- Use optional fields for new features on existing tables

1. **Backward Compatible API:**

```typescript
// Old endpoint still works
GET /api/trades/list

// New endpoint with extended data
GET /api/trades/list?include=journal,analysis
```

1. **Component Composition:**

```typescript
// Base trade card (MVP)
<TradeCard trade={trade} />

// Extended with journal (Phase 2)
<TradeCard trade={trade}>
  {trade.journalEntry && <JournalPreview entry={trade.journalEntry} />}
</TradeCard>
```

## Recommended Build Order

### Month 1: MVP ✅

Focus only on MVP structure - ignore all POST-MVP files

### Month 2: Journal 📓

Add:

- `app/(dashboard)/journal/**`
- `components/journal/**`
- `convex/journal*.ts`

### Month 3: Community 👥

Add:

- `app/(dashboard)/community/**`
- `components/community/**`
- `convex/community/**`
- Real-time messaging (Pusher/Ably)

### Month 4: LMS 🎓

Add:

- `app/(dashboard)/learn/**`
- `components/learn/**`
- `convex/learn/**`
- Video hosting (Mux/Cloudflare Stream)

### Month 5: Monetization 💰

Add:

- Stripe integration
- Subscription management
- Billing portal
- Feature gating

## Dependencies by Phase

### MVP

```json
{
  "next": "14.2.0",
  "convex": "^1.16.0",
  "better-auth": "^0.9.0",
  "@ai-sdk/anthropic": "^0.0.50",
  "inngest": "^3.22.0",
  "technicalindicators": "^3.1.0"
}
```

### \+ Community (Month 3)

```json
{
  "pusher": "^5.2.0",
  "pusher-js": "^8.4.0",
  "@tiptap/react": "^2.2.0"
}
```

### \+ LMS (Month 4)

```json
{
  "@mux/mux-player-react": "^2.5.0",
  "react-markdown": "^9.0.0",
  "pdf-lib": "^1.17.1"
}
```

### \+ Monetization (Month 5)

```json
{
  "stripe": "^14.17.0",
  "@stripe/stripe-js": "^2.4.0"
}
```

This structure is designed to scale from MVP to full platform without major refactoring!