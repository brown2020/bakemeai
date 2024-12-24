# Bake.me 🧑‍🍳

Bake.me is an AI-powered recipe generator that helps you create personalized recipes based on your ingredients, dietary preferences, and cooking experience.

![Bake.me Screenshot](/public/screenshot.png)

## Features ✨

- **AI Recipe Generation**: Get personalized recipes based on ingredients you have or dishes you want to make
- **Dietary Preferences**: Customize recipes based on your dietary restrictions and preferences
- **Save Favorites**: Build your personal collection of favorite recipes
- **User Profiles**: Set your cooking experience level and default serving sizes
- **Smart Suggestions**: Receive ingredient substitution suggestions and cooking tips

## Tech Stack 🛠️

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI**: OpenAI GPT-4o
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
