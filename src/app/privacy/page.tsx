import { PageLayout } from "@/components/PageLayout";

export default function Privacy() {
  const lastUpdated = "January 29, 2026";

  return (
    <PageLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${lastUpdated}`}
    >
      <div className="prose prose-blue max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Ignite Channel Inc (&quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) operates Bake.me. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you
            use our Service.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            By using Bake.me, you agree to the collection and use of information
            in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            Personal Information
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you create an account, we collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Display name (if provided)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">
            Profile Information
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            To personalize your experience, we may collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Dietary preferences (vegetarian, vegan, gluten-free, etc.)</li>
            <li>Food allergies and restrictions</li>
            <li>Cooking experience level</li>
            <li>Preferred cuisines</li>
            <li>Household serving size preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Usage Data</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We automatically collect information about how you use the Service:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Recipes you generate and save</li>
            <li>Ingredients you search for</li>
            <li>Features you use</li>
            <li>Browser type and version</li>
            <li>IP address and device information</li>
            <li>Time and date of visits</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            3. How We Use Your Information
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Provide, operate, and maintain the Service</li>
            <li>Generate personalized recipes based on your preferences</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about the Service</li>
            <li>Send you updates, security alerts, and support messages</li>
            <li>Analyze usage patterns to improve our AI models</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            4. Data Storage and Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We use Firebase by Google for authentication and data storage. Your
            data is stored securely using industry-standard encryption methods.
            We implement appropriate security measures to protect against
            unauthorized access, alteration, disclosure, or destruction of your
            personal information.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            However, no method of transmission over the Internet or electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your information, we cannot guarantee
            absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            5. Data Sharing and Disclosure
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell your personal information. We may share your
            information only in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Service Providers:</strong> We use OpenAI for AI recipe
              generation and Firebase for authentication and storage
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required by law or to
              protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger,
              acquisition, or sale of assets
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share information with
              your explicit permission
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Your Data Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate
              information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your account and
              associated data
            </li>
            <li>
              <strong>Portability:</strong> Export your saved recipes
            </li>
            <li>
              <strong>Objection:</strong> Object to certain data processing
              activities
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise these rights, please contact us at{" "}
            <a
              href="mailto:info@ignitechannel.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              info@ignitechannel.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar tracking technologies to maintain your
            session and improve the Service. You can control cookie settings
            through your browser preferences. Note that disabling cookies may
            affect the functionality of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our Service integrates with third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Firebase (Google):</strong> Authentication and database
              services
            </li>
            <li>
              <strong>OpenAI:</strong> AI-powered recipe generation
            </li>
            <li>
              <strong>Google Sign-In:</strong> OAuth authentication
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            These services have their own privacy policies. We encourage you to
            review their policies to understand how they handle your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            9. Children&apos;s Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service is not intended for users under the age of 13. We do not
            knowingly collect personal information from children under 13. If
            you become aware that a child has provided us with personal
            information, please contact us, and we will take steps to delete
            such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            10. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last updated&quot; date. You are advised to
            review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this Privacy Policy or our data
            practices, please contact us at:
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            <strong>Ignite Channel Inc</strong>
            <br />
            Email:{" "}
            <a
              href="mailto:info@ignitechannel.com"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              info@ignitechannel.com
            </a>
            <br />
            Website:{" "}
            <a
              href="https://ignitechannel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              ignitechannel.com
            </a>
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
