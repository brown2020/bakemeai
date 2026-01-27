import Image from "next/image";
import { HeroCTA } from "@/components/HeroCTA";
import { LightningIcon, CakeIcon, HeartIcon } from "@/components/icons/FeatureIcons";

const features = [
  {
    title: "AI-Powered Recipe Generation",
    description:
      "Get personalized recipes based on your ingredients or cravings",
    Icon: LightningIcon,
  },
  {
    title: "Dietary Preferences",
    description:
      "Customize recipes based on your dietary restrictions and preferences",
    Icon: CakeIcon,
  },
  {
    title: "Save Your Favorites",
    description: "Build your personal collection of favorite recipes",
    Icon: HeartIcon,
  },
];

/**
 * Home page - Server Component with minimal client-side hydration.
 * Only the HeroCTA component requires client-side JavaScript.
 */
export default function Home() {
  return (
    <div className="bg-surface-50">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600"
      >
        Skip to main content
      </a>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="main-content">
        <div className="relative py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Your personal</span>
                <span className="block text-primary-600">
                  AI chef assistant
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                Transform your ingredients into delicious recipes. Get
                personalized cooking suggestions based on your preferences and
                what you have in your kitchen.
              </p>
              <HeroCTA />
            </div>
            <div className="mt-12 lg:mt-0">
              <Image
                className="rounded-lg shadow-xl"
                src="/bakemekey.png"
                alt="BakeMe.ai Kitchen"
                width={1024}
                height={768}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to cook with confidence
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Let our AI-powered platform help you discover new recipes and make
              the most of your ingredients.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => {
                const { Icon } = feature;
                return (
                  <div key={feature.title} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <Icon />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.title}
                    </p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
