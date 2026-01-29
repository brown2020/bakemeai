import { PageLayout } from "@/components/PageLayout";
import Link from "next/link";

export default function Support() {
  return (
    <PageLayout title="Support" subtitle="Get help with Bake.me">
      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">How Can We Help?</h2>
          <p className="text-gray-700 leading-relaxed">
            We&apos;re here to help you get the most out of Bake.me. Browse our
            frequently asked questions below, or contact us directly if you need
            additional assistance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                How do I generate a recipe?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Simply{" "}
                <Link
                  href="/generate"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  go to the Generate page
                </Link>
                , choose whether you want to create a specific dish or use
                ingredients you have on hand, and let our AI do the rest. You
                can customize your experience by setting dietary preferences in
                your{" "}
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  profile
                </Link>
                .
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Can I save recipes?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Yes! After generating a recipe, click the &quot;Save
                Recipe&quot; button to add it to your collection. You can view
                all your saved recipes on the{" "}
                <Link
                  href="/saved"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Saved Recipes page
                </Link>
                .
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                How do I set dietary preferences?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Visit your{" "}
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Preferences page
                </Link>{" "}
                to set your dietary restrictions (vegetarian, vegan, keto,
                etc.), food allergies, cooking experience level, and more. Our
                AI will use these preferences to generate personalized recipes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Is Bake.me free to use?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Yes! You can create an account and start generating recipes for
                free. We may introduce premium features in the future, but core
                recipe generation will always remain accessible.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                How accurate are the AI-generated recipes?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our AI is trained on a vast database of recipes and cooking
                techniques, but we always recommend using your best judgment
                when cooking. Follow proper food safety guidelines and adjust
                recipes to your taste.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Can I share my recipes?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Currently, recipes are saved to your personal account. Recipe
                sharing features are on our roadmap for future updates!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                How do I delete my account?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                If you wish to delete your account and all associated data,
                please contact us at{" "}
                <a
                  href="mailto:info@ignitechannel.com"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  info@ignitechannel.com
                </a>{" "}
                with your request.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                What if I forget my password?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Click the &quot;Forgot your password?&quot; link on the{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  login page
                </Link>{" "}
                to receive a password reset email.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Still have questions? We&apos;re here to help!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
            <p className="text-gray-700 mb-4">
              Email us at:{" "}
              <a
                href="mailto:info@ignitechannel.com"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                info@ignitechannel.com
              </a>
            </p>
            <p className="text-sm text-gray-600">
              We typically respond within 24-48 hours during business days.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Report a Bug</h2>
          <p className="text-gray-700 leading-relaxed">
            Found a bug or technical issue? Please email us with:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
            <li>A description of the issue</li>
            <li>Steps to reproduce the problem</li>
            <li>Your browser and device information</li>
            <li>Screenshots (if applicable)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Send bug reports to:{" "}
            <a
              href="mailto:info@ignitechannel.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              info@ignitechannel.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Feature Requests</h2>
          <p className="text-gray-700 leading-relaxed">
            Have an idea for a new feature? We&apos;d love to hear from you!
            Send your suggestions to{" "}
            <a
              href="mailto:info@ignitechannel.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              info@ignitechannel.com
            </a>{" "}
            and help us make Bake.me even better.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
