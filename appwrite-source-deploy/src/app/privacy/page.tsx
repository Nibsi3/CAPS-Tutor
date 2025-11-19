export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <div className="relative isolate bg-background">
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
                Privacy Policy
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="pb-24 sm:pb-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="prose prose-lg dark:prose-invert max-w-none font-body">
              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p>
                  CAPS Tutor ("we", "us", or "our") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy complies with the Protection of Personal Information Act (POPIA) No. 4 of 2013 and other applicable South African data protection laws.
                </p>
                <p>
                  By accessing and using CAPS Tutor (the "Service"), you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with this policy, please do not use our Service.
                </p>
              </section>

              {/* Responsible Party */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">2. Responsible Party</h2>
                <p>
                  In accordance with POPIA, we are the "responsible party" for processing your personal information:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <p><strong>CAPS Tutor</strong></p>
                  <p>Email: hello@capstutor.ai</p>
                  <p>Physical Address: 123 Learning Lane, Cape Town, 8001, South Africa</p>
                  <p>Phone: +27 (21) 555-0123</p>
                </div>
              </section>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">3. Information We Collect</h2>
                <p>We collect the following categories of personal information:</p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, grade level, and subject preferences</li>
                  <li><strong>Educational Information:</strong> Academic progress, performance data, learning history, and assessment results</li>
                  <li><strong>Communication Data:</strong> Messages sent through our Service and any feedback you provide</li>
                  <li><strong>Profile Information:</strong> Optional profile picture, bio, and achievement settings</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Device Information:</strong> IP address, browser type, device type, and operating system</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, and navigation paths</li>
                  <li><strong>Technical Data:</strong> Cookies, session identifiers, and similar tracking technologies</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">4. How We Use Your Information</h2>
                <p>We process your personal information for the following lawful purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our educational services</li>
                  <li>Personalize learning content and recommendations based on your academic needs</li>
                  <li>Track and analyze your educational progress</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send important updates, notifications, and educational content</li>
                  <li>Detect and prevent fraud, abuse, and security threats</li>
                  <li>Comply with legal obligations and regulatory requirements</li>
                  <li>Conduct research and analytics to improve our Service (in anonymized form where possible)</li>
                </ul>
              </section>

              {/* Lawful Basis */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">5. Lawful Basis for Processing</h2>
                <p>Under POPIA, we process your personal information based on the following lawful grounds:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Consent:</strong> When you explicitly agree to our processing of your data</li>
                  <li><strong>Contract Performance:</strong> To fulfill our obligations under the Terms of Service</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable South African laws and regulations</li>
                  <li><strong>Legitimate Interest:</strong> To provide and improve our educational services, subject to your privacy rights</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">6. How We Share Your Information</h2>
                <p>We do not sell your personal information. We may share your information only in the following limited circumstances:</p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Service Providers</h3>
                <p>We work with trusted third-party service providers who assist us in operating our Service:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cloud hosting and infrastructure providers (e.g., Firebase, Google Cloud)</li>
                  <li>AI service providers for educational content generation</li>
                  <li>Analytics and performance monitoring services</li>
                  <li>Email and communication service providers</li>
                </ul>
                <p className="mt-4">All service providers are contractually bound to protect your information and use it only for the purposes specified by us.</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Legal Requirements</h3>
                <p>We may disclose your information if required by law or to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect our rights, privacy, safety, or property</li>
                  <li>Respond to emergency situations</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction, subject to this Privacy Policy.</p>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">7. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit using SSL/TLS protocols</li>
                  <li>Secure storage with access controls and authentication</li>
                  <li>Regular security assessments and updates</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                  <li>Staff training on data protection and privacy</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">8. Your Rights Under POPIA</h2>
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Right to Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
                  <li><strong>Right to Object:</strong> Object to certain processing activities (e.g., direct marketing)</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitations on how we process your information</li>
                  <li><strong>Right to Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time</li>
                  <li><strong>Right to Lodge a Complaint:</strong> File a complaint with the Information Regulator</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at <a href="mailto:hello@capstutor.ai" className="text-primary hover:underline">hello@capstutor.ai</a>.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">9. Data Retention</h2>
                <p>We retain your personal information only for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fulfill the purposes for which it was collected</li>
                  <li>Comply with legal, regulatory, or accounting requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                </ul>
                <p className="mt-4">
                  When personal information is no longer needed, we securely delete or anonymize it. Educational records may be retained for extended periods to support long-term learning analytics and academic progress tracking.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
                <p>
                  Our Service is designed for learners in Grades 10-12. If you are under 18, please ensure you have your parent's or guardian's consent before providing any personal information to us.
                </p>
                <p className="mt-4">
                  We take special care to protect the privacy of minors. We do not knowingly collect personal information from children without appropriate consent. If you believe we have inadvertently collected information from a minor without proper consent, please contact us immediately.
                </p>
              </section>

              {/* Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">11. Cookies and Tracking Technologies</h2>
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our Service</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our Service.
                </p>
              </section>

              {/* Cross-Border Transfers */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">12. Cross-Border Data Transfers</h2>
                <p>
                  Your personal information may be transferred to and processed in countries outside South Africa. When we transfer data internationally, we ensure appropriate safeguards are in place to protect your information in accordance with POPIA.
                </p>
              </section>

              {/* Changes to Policy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">13. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the Service after changes become effective constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">14. Contact Us</h2>
                <p>If you have questions, concerns, or wish to exercise your rights under POPIA, please contact us:</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <p><strong>CAPS Tutor</strong></p>
                  <p>Email: <a href="mailto:hello@capstutor.ai" className="text-primary hover:underline">hello@capstutor.ai</a></p>
                  <p>Physical Address: 123 Learning Lane, Cape Town, 8001, South Africa</p>
                  <p>Phone: +27 (21) 555-0123</p>
                  <p className="mt-4">
                    <strong>Information Regulator of South Africa</strong><br />
                    Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.justice.gov.za/inforeg/</a>
                  </p>
                </div>
              </section>

              {/* Information Regulator */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">15. Information Regulator</h2>
                <p>
                  You have the right to lodge a complaint with the Information Regulator if you believe we have violated your privacy rights under POPIA:
                </p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <p><strong>Information Regulator of South Africa</strong></p>
                  <p>Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.justice.gov.za/inforeg/</a></p>
                </div>
              </section>
            </div>

            {/* Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-8">
              <a href="/" className="text-primary hover:underline">← Back to Home</a>
              <a href="/terms" className="text-primary hover:underline">Terms of Service →</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}








