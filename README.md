# BakeMe.ai 🧑‍🍳

BakeMe.ai is an AI-powered recipe generator that helps you create personalized recipes based on your ingredients, dietary preferences, and cooking experience.

![BakeMe.ai Screenshot](screenshot.png)

## Features ✨

- **AI Recipe Generation**: Get personalized recipes based on ingredients you have or dishes you want to make
- **Dietary Preferences**: Customize recipes based on your dietary restrictions and preferences
- **Save Favorites**: Build your personal collection of favorite recipes
- **User Profiles**: Set your cooking experience level and default serving sizes
- **Smart Suggestions**: Receive ingredient substitution suggestions and cooking tips

## Tech Stack 🛠️

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Getting Started 🚀

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/brown2020/bakemeai.git
cd bakemeai
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```

4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
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
- All contributors who have helped shape BakeMe.ai

---

Made with ❤️ by [Your Name/Team]
