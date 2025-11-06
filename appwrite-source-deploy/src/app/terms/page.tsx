export default function TermsPage() {
  return (
    <main className="flex-1">
      <div className="relative isolate bg-background">
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
                Terms of Service
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
                <h2 className="text-2xl font-bold mb-4">1. Introduction and Acceptance</h2>
                <p>
                  Welcome to CAPS Tutor. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and CAPS Tutor ("we", "us", or "our") governing your use of our online educational platform and services (the "Service").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use our Service. These Terms apply to all users, including students, parents, guardians, and teachers.
                </p>
                <p>
                  These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of South Africa.
                </p>
              </section>

              {/* Service Description */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p>
                  CAPS Tutor is an AI-powered educational platform designed to provide personalized tutoring aligned with the South African Curriculum and Assessment Policy Statement (CAPS) for Grades 8-12.
                </p>
                <p>The Service includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Adaptive practice questions and assessments</li>
                  <li>AI-powered instant feedback and explanations</li>
                  <li>Progress tracking and analytics</li>
                  <li>Educational content aligned with CAPS syllabus</li>
                  <li>Interactive tutoring features</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without notice.
                </p>
              </section>

              {/* Eligibility */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">3. Eligibility and User Accounts</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Age Requirements</h3>
                <p>
                  The Service is intended for learners in Grades 8-12. If you are under 18 years of age, you must have your parent's or guardian's permission to use the Service. By creating an account, you represent that you meet the age requirements or have obtained necessary parental consent.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Account Creation</h3>
                <p>To use certain features of the Service, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breach</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or use the Service in a manner that compromises its integrity or other users' experience.
                </p>
              </section>

              {/* Acceptable Use */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">4. Acceptable Use Policy</h2>
                <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must NOT:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Attempt to hack, breach, or circumvent any security measures</li>
                  <li>Use automated systems (bots, scrapers) to access the Service</li>
                  <li>Copy, reproduce, or distribute content without authorization</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Impersonate any person or entity or misrepresent your identity</li>
                  <li>Upload malicious code, viruses, or harmful software</li>
                  <li>Engage in any form of cheating, collusion, or academic dishonesty</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable South African laws or regulations</li>
                  <li>Use the Service for commercial purposes without written consent</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">5. Intellectual Property Rights</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Our Content</h3>
                <p>
                  All content, features, and functionality of the Service, including but not limited to text, graphics, logos, images, software, and educational materials, are owned by CAPS Tutor or its licensors and are protected by South African and international copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Limited License</h3>
                <p>
                  We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial educational purposes only. This license does not include the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sell, resell, or commercialize the Service</li>
                  <li>Modify or create derivative works of our content</li>
                  <li>Republish or distribute our content outside the Service</li>
                  <li>Reverse engineer or decompile any software</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.3 User-Generated Content</h3>
                <p>
                  You retain ownership of any content you submit through the Service. However, by submitting content, you grant us a worldwide, royalty-free, perpetual license to use, reproduce, modify, and distribute your content for the purpose of providing and improving the Service.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.4 Third-Party Content</h3>
                <p>
                  The Service may contain content from third parties or links to third-party websites. We do not endorse or assume responsibility for any third-party content or websites.
                </p>
              </section>

              {/* Fees and Payments */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">6. Fees and Payment Terms</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Free and Paid Services</h3>
                <p>
                  Some features of the Service may be provided free of charge, while others may require payment. We reserve the right to change our pricing at any time with reasonable notice.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Payment Terms</h3>
                <p>If you purchase paid services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All fees are quoted in South African Rand (ZAR) and are inclusive of VAT where applicable</li>
                  <li>You agree to pay all charges associated with your account</li>
                  <li>Payments are processed through secure third-party payment processors</li>
                  <li>We reserve the right to refuse or cancel any order at our discretion</li>
                  <li>Refunds will be governed by our Refund Policy (if applicable)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Subscription Services</h3>
                <p>
                  If you subscribe to recurring services, you authorize us to charge your payment method on a recurring basis until you cancel your subscription. You may cancel your subscription at any time through your account settings.
                </p>
              </section>

              {/* Privacy */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">7. Privacy and Data Protection</h2>
                <p>
                  Your privacy is important to us. Our collection, use, and disclosure of your personal information is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which complies with the Protection of Personal Information Act (POPIA) No. 4 of 2013.
                </p>
                <p>
                  By using the Service, you consent to our privacy practices as described in the Privacy Policy. Please review the Privacy Policy carefully.
                </p>
              </section>

              {/* Disclaimer of Warranties */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Warranties of merchantability and fitness for a particular purpose</li>
                  <li>Accuracy, completeness, or reliability of content</li>
                  <li>Uninterrupted or error-free operation of the Service</li>
                  <li>Security or freedom from viruses or harmful components</li>
                </ul>
                <p className="mt-4">
                  While we strive to provide accurate educational content aligned with CAPS, we do not guarantee that the Service will meet your specific educational requirements or that results obtained will meet your expectations.
                </p>
                <p className="mt-4">
                  This disclaimer does not affect your statutory rights as a consumer under South African law.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY SOUTH AFRICAN LAW, CAPS TUTOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Personal injury or property damage</li>
                  <li>Costs of substitute services</li>
                </ul>
                <p className="mt-4">
                  Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or R100, whichever is greater.
                </p>
                <p className="mt-4">
                  These limitations do not affect liability that cannot be excluded or limited under applicable South African law, including liability for death or personal injury caused by negligence.
                </p>
              </section>

              {/* Indemnification */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless CAPS Tutor, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your violation of any applicable laws or regulations</li>
                </ul>
              </section>

              {/* Termination */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">11.1 Termination by You</h3>
                <p>
                  You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">11.2 Termination by Us</h3>
                <p>
                  We may suspend or terminate your access to the Service immediately, without prior notice, if you breach these Terms or for any other reason at our sole discretion.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">11.3 Effect of Termination</h3>
                <p>
                  Upon termination, your right to use the Service will immediately cease. We may delete your account and data, subject to our data retention obligations under the Privacy Policy and POPIA.
                </p>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">12. Dispute Resolution and Governing Law</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">12.1 Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law provisions.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">12.2 Jurisdiction</h3>
                <p>
                  Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of South Africa, specifically the High Court of South Africa.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">12.3 Alternative Dispute Resolution</h3>
                <p>
                  Before initiating formal legal proceedings, both parties agree to attempt to resolve disputes through good faith negotiation. If negotiation fails, parties may seek mediation or arbitration as an alternative to litigation.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">13. Changes to These Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posting the updated Terms on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Notifying you via email or through the Service</li>
                </ul>
                <p className="mt-4">
                  Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service.
                </p>
              </section>

              {/* Miscellaneous */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">14. Miscellaneous Provisions</h2>
                <h3 className="text-xl font-semibold mt-6 mb-3">14.1 Entire Agreement</h3>
                <p>
                  These Terms, together with the Privacy Policy, constitute the entire agreement between you and CAPS Tutor regarding the Service and supersede all prior agreements.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">14.2 Severability</h3>
                <p>
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">14.3 Waiver</h3>
                <p>
                  Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">14.4 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">14.5 Force Majeure</h3>
                <p>
                  We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, pandemics, government actions, or infrastructure failures.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">14.6 Consumer Rights</h3>
                <p>
                  These Terms do not limit your statutory rights as a consumer under South African law, including rights under the Consumer Protection Act No. 68 of 2008.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
                <p>If you have questions about these Terms, please contact us:</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <p><strong>CAPS Tutor</strong></p>
                  <p>Email: <a href="mailto:hello@capstutor.ai" className="text-primary hover:underline">hello@capstutor.ai</a></p>
                  <p>Physical Address: 123 Learning Lane, Cape Town, 8001, South Africa</p>
                  <p>Phone: +27 (21) 555-0123</p>
                </div>
              </section>

              {/* Acknowledgement */}
              <section className="mb-12">
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                  <p className="font-semibold">By using CAPS Tutor, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
                </div>
              </section>
            </div>

            {/* Navigation */}
            <div className="mt-16 flex items-center justify-between border-t pt-8">
              <a href="/privacy" className="text-primary hover:underline">← Privacy Policy</a>
              <a href="/" className="text-primary hover:underline">Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}








