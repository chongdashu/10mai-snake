# 10m AI Gamedev Template

A starting point for creating browser-based games using AI assistance, powered by Phaser 3 and Supabase.

## Tech Stack

- Phaser 3 game framework
- TypeScript support
- Supabase authentication and database integration
- Vite for fast development and optimized builds
- PWA support
- ESLint and Prettier for code quality
- Hot module replacement during development

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase project (for backend services)

## Setup

1. Clone or copy this template
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run lint:check` - Check code for linting errors

## Project Structure

```
├── src/                # Source code directory
│   ├── scenes/        # Phaser scene components
│   │   └── MainScene.ts # Main game scene implementation
│   ├── services/      # External services integration
│   │   └── supabase/  # Supabase client integration
│   │       └── client.ts # Supabase client configuration
│   ├── game.ts        # Game configuration
│   └── env.d.ts       # Environment type definitions
├── public/            # Static assets
├── .env              # Environment variables (not in git)
├── .env.example      # Example environment variables
├── .eslintrc.json    # ESLint configuration
├── .prettierrc       # Prettier formatting rules
├── tsconfig.json     # TypeScript configuration
├── vite.config.ts    # Vite build configuration
└── README.md         # Project documentation
```

## Adding Game Content

1. Create new scenes in `src/scenes/`
2. Add scenes to the game configuration in `src/game.ts`
3. Add assets to the `public/` directory
4. Configure Supabase tables and policies as needed

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the contents of the `dist/` directory to your hosting service

## License

MIT
