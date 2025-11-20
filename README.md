# Bake.me 🧑‍🍳

[![CI](https://img.shields.io/badge/next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-19.1-61dafb?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Bake.me is an AI-powered recipe generator that helps you create personalized recipes based on your ingredients, dietary preferences, and cooking experience. The project is built with a modern Next.js 16 stack, leverages Vercel’s AI SDK for deterministic recipe generation, and integrates Firebase for auth, database, and storage.

## Table of Contents

1. [Features](#features-)
2. [Tech Stack](#tech-stack-)
3. [Project Structure](#project-structure-)
4. [Getting Started](#getting-started-)
5. [Configuration](#configuration-)
6. [Available Scripts](#available-scripts-)
7. [Architecture](#architecture-)
8. [Contributing](#contributing-)
9. [License](#license-)
10. [Roadmap](#roadmap-)
11. [Contact](#contact-)

![Bake.me Screenshot](/public/screenshot.png)

## Features ✨

- **AI Recipe Generation**: Get personalized recipes based on ingredients you have or dishes you want to make
- **Structured Data**: Recipes are generated as structured data for consistent formatting
- **Dietary Preferences**: Customize recipes based on your dietary restrictions and preferences
- **Save Favorites**: Build your personal collection of favorite recipes
- **User Profiles**: Set your cooking experience level and default serving sizes
- **Smart Suggestions**: Receive ingredient substitution suggestions and cooking tips

## Tech Stack 🛠️

- **Framework**: Next.js 16.0 (App Router, React Server Components)
- **UI**: React 19.1, Tailwind CSS 4.1, Lucide Icons
- **State Management**: Zustand 5.0 with persisted stores
- **AI Platform**: Vercel AI SDK 5 (Core, React, RSC, OpenAI provider) using `gpt-5.1-chat-latest`
- **Validation**: Zod 4.1 for schema-driven AI responses
- **Backend Services**: Firebase Auth, Firestore, Cloud Storage
- **Tooling**: TypeScript 5.9, ESLint 9, PostCSS 8
- **Deployment**: Vercel

## Project Structure 🗂️

```
src/
├─ app/
│  ├─ layout.tsx            # Root layout + Auth listener
│  ├─ page.tsx              # Landing page
│  ├─ generate/             # Recipe generation experience
│  ├─ profile/              # User preferences
│  └─ saved/                # Saved recipe library
├─ components/              # Shared UI components
├─ lib/
│  ├─ actions.ts            # Server actions (AI calls)
│  ├─ db.ts                 # Firestore helpers
│  ├─ firebase.ts           # Firebase client bootstrap
│  └─ store/                # Zustand stores (auth, recipe, profile)
└─ public/
```

## Getting Started 🚀

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/brown2020/bakemeai.git
   cd bakemeai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Configuration ⚙️

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket used for uploads |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `OPENAI_API_KEY` | API key for the OpenAI provider powering `gpt-5.1-chat-latest` via Vercel AI SDK |

> ℹ️ The AI model is configured with `temperature: 0` for deterministic outputs. You can change this in `src/lib/actions.ts`.

## Available Scripts 🧪

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with hot reloading |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## Architecture 🏗️

The project follows a clean, modular architecture:

- **State Management**: Uses `zustand` for global state, replacing Context API to avoid provider nesting. Stores are located in `src/lib/store/`.
- **AI Integration**: Leverages `streamObject` from the Vercel AI SDK for type-safe, structured JSON responses from the LLM.
- **Persistence**: Recipe inputs and state are persisted to local storage using Zustand middleware to prevent data loss on refresh.
- **Components**: Reusable UI components are in `src/components/`, with feature-specific components co-located in their respective directories.
- **Deterministic Dependencies**: All npm dependencies are locked via `package-lock.json` to guarantee reproducible installs in CI and local development.

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact 📧

- Project Link: [https://github.com/brown2020/bakemeai](https://github.com/brown2020/bakemeai)
- Email: info@ignitechannel.com

## Acknowledgments 🙏

- [OpenAI](https://openai.com) for providing the AI capabilities
- [Firebase](https://firebase.google.com) for authentication and database services
- [Vercel](https://vercel.com) for hosting and deployment
- All contributors who have helped shape Bake.me

## Roadmap 🗺️

We're excited about the future of Bake.me! Here are some features we're planning:

### Near-term

- [ ] Recipe difficulty ratings and time estimates
- [ ] Ingredient substitution suggestions
- [ ] Unit conversion (metric/imperial)
- [ ] Print-friendly recipe format
- [ ] Share recipes with friends

### Mid-term

- [ ] Meal planning calendar
- [ ] Shopping list generation
- [ ] Recipe scaling
- [ ] Nutritional information
- [ ] Recipe collections and categories
- [ ] Mobile app version

### Long-term

- [ ] Integration with smart kitchen devices
- [ ] Voice-guided cooking instructions
- [ ] Community recipe sharing
- [ ] AI-powered meal plan optimization
- [ ] Cooking technique videos
- [ ] Ingredient inventory management

### Developer Experience

- [ ] Improved test coverage
- [ ] API documentation
- [ ] Developer guides
- [ ] Performance optimizations
- [ ] Accessibility improvements

## Calling All Cooking Coders! 👩‍🍳👨‍💻

Are you passionate about both cooking and coding? We'd love your help in making Bake.me the ultimate cooking companion! Whether you're a:

- Frontend developer who loves crafting delicious UIs
- Backend engineer with a taste for robust architectures
- ML enthusiast interested in recipe generation
- UX designer who wants to make cooking more enjoyable
- Food enthusiast with technical skills

Your contributions are welcome! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

Some great first issues to tackle:

- Improving recipe parsing accuracy
- Adding more dietary preference options
- Enhancing the mobile experience
- Implementing new recipe features
- Writing tests and documentation

Join our community of cooking coders and help make home cooking smarter and more accessible for everyone!

---

Made with ❤️ by Ignite Channel
