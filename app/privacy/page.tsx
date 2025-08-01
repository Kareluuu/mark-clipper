import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Mark Clipper',
  description: 'Privacy Policy for Mark Clipper Extension and Web Application',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Mark Clipper (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Chrome browser extension and web application (collectively, the &quot;Service&quot;).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Account Information:</strong> When you create an account, we collect your email address, name, and authentication credentials through third-party providers (Google, GitHub, etc.)</li>
              <li><strong>Content Data:</strong> Text content you choose to save from web pages, including the source URL and page title</li>
              <li><strong>Categories and Tags:</strong> Organization labels you create for your saved content</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">2.2 Information Automatically Collected</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Usage Data:</strong> Information about how you interact with our Service</li>
              <li><strong>Device Information:</strong> Browser type, extension version, and operating system</li>
              <li><strong>Authentication Tokens:</strong> Temporary tokens for maintaining your login session</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To save, organize, and synchronize your content across devices</li>
              <li>To improve and optimize our Service</li>
              <li>To communicate with you about service updates and support</li>
              <li>To ensure security and prevent misuse of our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Third-Party Services</h3>
            <p className="text-gray-700 mb-4">We may share your information with the following third parties:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Authentication Providers:</strong> Google, GitHub, or other OAuth providers for account verification</li>
              <li><strong>Cloud Infrastructure:</strong> Supabase for secure data storage and database management</li>
              <li><strong>Hosting Services:</strong> Vercel for application hosting and delivery</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">4.2 Legal Requirements</h3>
            <p className="text-gray-700">
              We may disclose your information if required to do so by law or in response to valid legal requests, such as court orders or government regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Chrome Extension Permissions</h2>
            <p className="text-gray-700 mb-4">Our Chrome extension requests the following permissions:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>activeTab:</strong> To access content you select on web pages</li>
              <li><strong>storage:</strong> To cache authentication tokens and user preferences locally</li>
              <li><strong>scripting:</strong> To inject our interface for content selection</li>
              <li><strong>tabs:</strong> To manage authentication flow and notifications</li>
              <li><strong>identity:</strong> To enable secure OAuth authentication</li>
              <li><strong>notifications:</strong> To provide operation feedback</li>
              <li><strong>webNavigation:</strong> To handle authentication redirects</li>
              <li><strong>Host permissions:</strong> To communicate with our secure servers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, secure authentication protocols, and regular security assessments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. You may delete your account and associated data at any time through the application settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Access and review your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers are conducted in accordance with applicable data protection laws and with appropriate safeguards in place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@mark-clipper.com<br />
                <strong>Subject:</strong> Privacy Policy Inquiry
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Compliance</h2>
            <p className="text-gray-700">
              This Privacy Policy complies with applicable privacy laws including GDPR, CCPA, and Chrome Web Store privacy requirements. We are committed to maintaining the highest standards of privacy protection for all users.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}