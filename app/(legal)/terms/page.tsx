// app/(legal)/terms/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | SwiftTasks",
    description: "Terms and conditions for using the SwiftTasks application",
};

export default function TermsOfServicePage() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: March 21, 2025</p>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Introduction</h2>
                <p>
                    Welcome to SwiftTasks. These Terms of Service ("Terms") govern your access to and use of the
                    SwiftTasks application and services. Please read these Terms carefully before using our application.
                </p>
                <p>
                    By accessing or using SwiftTasks, you agree to be bound by these Terms. If you disagree with any part
                    of the Terms, you may not access or use our application.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Definitions</h2>
                <ul>
                    <li>
                        <strong>"Application"</strong> refers to SwiftTasks, our web application for task management.
                    </li>
                    <li>
                        <strong>"User"</strong>, <strong>"You"</strong>, and <strong>"Your"</strong> refer to the individual or entity that accesses or uses the Application.
                    </li>
                    <li>
                        <strong>"We"</strong>, <strong>"Us"</strong>, and <strong>"Our"</strong> refer to SwiftTasks and its operators.
                    </li>
                    <li>
                        <strong>"Content"</strong> refers to all information, data, text, and other materials that are created, uploaded, or shared through the Application.
                    </li>
                </ul>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">User Accounts</h2>

                <h3 className="text-xl font-semibold mt-6">Registration</h3>
                <p>
                    To use certain features of the Application, you must register for an account. You agree to provide
                    accurate, current, and complete information during the registration process and to update such information
                    to keep it accurate, current, and complete.
                </p>

                <h3 className="text-xl font-semibold mt-6">Account Security</h3>
                <p>
                    You are responsible for safeguarding the password that you use to access the Application and for any
                    activities or actions that occur under your account. We encourage you to use "strong" passwords (passwords
                    that use a combination of upper and lowercase letters, numbers, and symbols) with your account.
                </p>

                <h3 className="text-xl font-semibold mt-6">Account Types</h3>
                <p>
                    The Application offers different types of accounts, including individual and team accounts. The features
                    available to you will depend on the type of account you register for.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">User Responsibilities</h2>

                <h3 className="text-xl font-semibold mt-6">Acceptable Use</h3>
                <p>
                    You agree to use the Application only for purposes that are legal, proper, and in accordance with these
                    Terms and any applicable laws or regulations. You agree not to:
                </p>
                <ul>
                    <li>Use the Application in any way that violates any applicable local, state, national, or international law or regulation</li>
                    <li>Use the Application to transmit any material that is defamatory, offensive, or otherwise objectionable</li>
                    <li>Attempt to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Application</li>
                    <li>Use any robot, spider, or other automatic device, process, or means to access the Application for any purpose</li>
                    <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">User Content</h3>
                <p>
                    You retain ownership of any Content that you submit, post, or display on or through the Application.
                    By submitting, posting, or displaying Content, you grant us a worldwide, non-exclusive, royalty-free
                    license to use, reproduce, adapt, modify, publish, and distribute such Content for the purpose of
                    providing and improving the Application.
                </p>
                <p>
                    You represent and warrant that you own or have the necessary rights to the Content you submit, and
                    that such Content does not violate the rights of any third party.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Intellectual Property</h2>

                <h3 className="text-xl font-semibold mt-6">Our Intellectual Property</h3>
                <p>
                    The Application and its original content, features, and functionality are owned by SwiftTasks and are
                    protected by international copyright, trademark, patent, trade secret, and other intellectual property
                    or proprietary rights laws.
                </p>

                <h3 className="text-xl font-semibold mt-6">Feedback</h3>
                <p>
                    Any feedback, comments, or suggestions you may provide regarding the Application is entirely voluntary,
                    and we will be free to use such feedback, comments, or suggestions without any obligation to you.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Third-Party Services</h2>

                <h3 className="text-xl font-semibold mt-6">Supabase</h3>
                <p>
                    Our Application uses Supabase for authentication and data storage. By using our Application, you acknowledge
                    and agree that you are also bound by
                    <a href="https://supabase.com/terms" className="text-blue-600 dark:text-blue-400 ml-1" target="_blank" rel="noopener noreferrer">
                        Supabase's Terms of Service
                    </a>.
                </p>

                <h3 className="text-xl font-semibold mt-6">Vercel</h3>
                <p>
                    Our Application is hosted on Vercel. By using our Application, you acknowledge and agree that you are also bound by
                    <a href="https://vercel.com/legal/terms" className="text-blue-600 dark:text-blue-400 ml-1" target="_blank" rel="noopener noreferrer">
                        Vercel's Terms of Service
                    </a>.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Privacy</h2>
                <p>
                    Your use of the Application is also governed by our Privacy Policy, which is incorporated into these Terms
                    by reference. Please review our
                    <a href="/privacy" className="text-blue-600 dark:text-blue-400 ml-1">
                        Privacy Policy
                    </a>
                    to understand our practices regarding the collection, use, and disclosure of your personal information.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Disclaimers</h2>

                <h3 className="text-xl font-semibold mt-6">"As Is" and "As Available"</h3>
                <p>
                    The Application is provided on an "as is" and "as available" basis, without warranties of any kind,
                    either express or implied, including, but not limited to, implied warranties of merchantability, fitness
                    for a particular purpose, or non-infringement.
                </p>

                <h3 className="text-xl font-semibold mt-6">Service Availability</h3>
                <p>
                    We do not guarantee that the Application will be available at all times. We may experience hardware,
                    software, or other problems or need to perform maintenance related to the Application, resulting in
                    interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue,
                    or otherwise modify the Application at any time without notice.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
                <p>
                    In no event shall SwiftTasks, its officers, directors, employees, or agents be liable for any indirect,
                    incidental, special, consequential, or punitive damages, including without limitation, loss of profits,
                    data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul>
                    <li>Your access to or use of or inability to access or use the Application</li>
                    <li>Any conduct or content of any third party on the Application</li>
                    <li>Any content obtained from the Application</li>
                    <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                </ul>
                <p>
                    The limitations of liability set forth above shall apply to the maximum extent permitted by law.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Indemnification</h2>
                <p>
                    You agree to defend, indemnify, and hold harmless SwiftTasks and its officers, directors, employees,
                    and agents from and against any and all claims, damages, obligations, losses, liabilities, costs or debt,
                    and expenses (including but not limited to attorney's fees) arising from:
                </p>
                <ul>
                    <li>Your use of and access to the Application</li>
                    <li>Your violation of any term of these Terms</li>
                    <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
                    <li>Any claim that your Content caused damage to a third party</li>
                </ul>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Termination</h2>
                <p>
                    We may terminate or suspend your account and bar access to the Application immediately, without prior
                    notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to
                    a breach of the Terms.
                </p>
                <p>
                    If you wish to terminate your account, you may simply discontinue using the Application, or contact us
                    to request account deletion.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Governing Law</h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                    without regard to its conflict of law provisions.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Changes to These Terms</h2>
                <p>
                    We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes
                    by posting the new Terms on this page and updating the "Last Updated" date at the top.
                </p>
                <p>
                    By continuing to access or use our Application after any revisions become effective, you agree to be bound
                    by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Application.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Severability</h2>
                <p>
                    If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck
                    and the remaining provisions shall be enforced to the fullest extent under law.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Waiver</h2>
                <p>
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                    If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and
                    the remaining provisions shall be enforced.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Entire Agreement</h2>
                <p>
                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding
                    our Application and supersede any prior agreements we might have had between us regarding the Application.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at:</p>
                <ul>
                    <li><strong>Email</strong>: <a href="mailto:contact@danblock.dev" className="text-blue-600 dark:text-blue-400">contact@danblock.dev</a></li>
                </ul>
            </section>
        </div>
    );
}