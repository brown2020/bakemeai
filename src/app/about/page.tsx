import { PageLayout } from "@/components/PageLayout";
import Link from "next/link";

export default function About() {
  return (
    <PageLayout
      title="About Bake.me"
      subtitle="AI-powered recipe generation for everyone"
    >
      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            Bake.me is revolutionizing home cooking by making personalized
            recipe generation accessible to everyone. Whether you&apos;re
            working with limited ingredients or looking to create something
            specific, our AI-powered platform helps you discover delicious
            recipes tailored to your needs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">What We Do</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Bake.me combines cutting-edge AI technology with culinary expertise
            to generate custom recipes based on:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>The ingredients you have on hand</li>
            <li>Specific dishes you want to create</li>
            <li>Your dietary preferences and restrictions</li>
            <li>Your cooking skill level</li>
            <li>Serving size requirements</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Our platform takes the guesswork out of meal planning and helps
            reduce food waste by making the most of what&apos;s already in your
            kitchen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">About Ignite Channel Inc</h2>
          <p className="text-gray-700 leading-relaxed">
            Bake.me is built by Ignite Channel Inc, a technology company focused
            on creating innovative solutions that make everyday tasks easier and
            more enjoyable. We believe in the power of AI to enhance human
            creativity and capability, not replace it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Ready to create your first AI-generated recipe? Sign up for free and
            start cooking smarter today.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Create Account
          </Link>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            Have questions or feedback? Visit our{" "}
            <Link
              href="/support"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Support page
            </Link>{" "}
            or email us at{" "}
            <a
              href="mailto:info@ignitechannel.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              info@ignitechannel.com
            </a>
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
