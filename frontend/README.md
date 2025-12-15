# PyPole Frontend - F1 Analytics

Next.js 15 frontend for PyPole F1 Analytics application.

## Features

- **Next.js 15** - App Router with React Server Components
- **TypeScript** - Type-safe development
- **Shadcn/ui** - Beautiful, accessible UI components
- **TanStack Query** - Data fetching and caching
- **Recharts** - Interactive data visualizations
- **Next Themes** - Dark/Light mode support
- **Tailwind CSS** - Utility-first styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` and configure your backend URL

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
frontend/
├── app/                 # Next.js app router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Dashboard
│   ├── schedule/       # Schedule page
│   ├── standings/      # Standings page
│   ├── race/           # Race analysis page
│   └── settings/       # Settings page
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── RaceCard.tsx
│   ├── StandingsTable.tsx
│   ├── LapTimeChart.tsx
│   ├── ThemeToggle.tsx
│   └── Sidebar.tsx
├── lib/                # Utilities
│   ├── api.ts          # Axios instance
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Helper functions
├── hooks/              # Custom React hooks
│   ├── useNextRace.ts
│   └── useStandings.ts
└── providers/          # Context providers
    ├── ThemeProvider.tsx
    └── ReactQueryProvider.tsx
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features

### Dashboard
- Next race information
- Championship leader
- Top 5 drivers standings

### Schedule
- Complete season calendar
- Race details with location and date
- Past and upcoming race indicators

### Standings
- Driver standings table
- Constructor standings table
- Team colors
- Points and wins

### Race Analysis
- Lap time charts
- Tire strategy visualization
- Session selection (FP1, FP2, FP3, Q, S, R)
- Multi-driver comparison

### Settings
- Dark/Light theme toggle
- Favorite team and driver preferences
- Application information

## Styling

The application uses Tailwind CSS with custom F1 team colors and tire compound colors defined in `globals.css`.

### Team Colors
- Red Bull Racing
- Ferrari
- Mercedes
- McLaren
- Aston Martin
- Alpine
- Williams
- RB (Racing Bulls)
- Kick Sauber
- Haas

### Tire Compounds
- Soft (Red)
- Medium (Yellow)
- Hard (White)
- Intermediate (Green)
- Wet (Blue)

## API Integration

The frontend communicates with the FastAPI backend via axios. All API calls are defined in:
- `lib/api.ts` - Axios instance with interceptors
- `hooks/` - React Query hooks for data fetching

## Theme Support

Dark and light themes are supported via `next-themes`. The theme toggle is available in the top-right corner of all pages.

## Deployment

### Vercel (Recommended)

```bash
npm run build
```

Then deploy to Vercel or any Node.js hosting platform.

### Docker

Build the production image:

```bash
docker build -t pypole-frontend .
docker run -p 3000:3000 pypole-frontend
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000/api/v1)
- `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
- `NEXTAUTH_SECRET` - NextAuth secret key
- `AUTH_SECRET` - Auth.js v5 secret key
- `AUTH_URL` - Auth.js v5 application URL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper types for all components and functions
4. Test thoroughly before submitting

