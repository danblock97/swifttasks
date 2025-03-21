// app/(legal)/privacy/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | SwiftTasks",
    description: "Learn how SwiftTasks collects, uses, and protects your information",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: March 21, 2025</p>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Introduction</h2>
                <p>
                    SwiftTasks ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use our web application.
                </p>
                <p>
                    Please read this Privacy Policy carefully. By accessing or using SwiftTasks, you acknowledge that you have read, understood,
                    and agree to be bound by the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not
                    use our application.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Information We Collect</h2>

                <h3 className="text-xl font-semibold mt-6">Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide to us, including:</p>
                <ul>
                    <li>
                        <strong>Account Information</strong>: When you register, we collect your name and email address.
                    </li>
                    <li>
                        <strong>Profile Information</strong>: Information you add to your profile, such as display name and avatar.
                    </li>
                    <li>
                        <strong>Content</strong>: Information you provide through the application, including tasks, projects, and documentation.
                    </li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Automatically Collected Information</h3>
                <p>When you access or use our application, we may automatically collect certain information about your device and usage patterns, including:</p>
                <ul>
                    <li>
                        <strong>Usage Data</strong>: Information about how you use our application, including which features you use most frequently.
                    </li>
                    <li>
                        <strong>Device Information</strong>: Information about your device, operating system, browser type, and IP address.
                    </li>
                    <li>
                        <strong>Cookies and Similar Technologies</strong>: We use cookies and similar tracking technologies to track activity and store certain information. See our Cookie Policy for more details.
                    </li>
                </ul>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
                <p>We may use the information we collect for various purposes, including to:</p>
                <ul>
                    <li>Provide, maintain, and improve our application</li>
                    <li>Create and manage your account</li>
                    <li>Process and complete transactions</li>
                    <li>Send you technical notices, updates, security alerts, and support messages</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Prevent fraudulent or illegal activities</li>
                    <li>Analyze usage patterns and trends</li>
                    <li>Personalize your experience</li>
                </ul>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Data Storage and Processing</h2>
                <p>
                    Your information is stored and processed on secure servers provided by Supabase and Vercel. By using SwiftTasks,
                    you consent to the transfer of your information to these third-party service providers.
                </p>

                <h3 className="text-xl font-semibold mt-6">Supabase</h3>
                <p>
                    We use Supabase to store and process your data. Supabase's Privacy Policy can be found at
                    <a href="https://supabase.com/privacy" className="text-blue-600 dark:text-blue-400 ml-1" target="_blank" rel="noopener noreferrer">
                        https://supabase.com/privacy
                    </a>.
                </p>

                <h3 className="text-xl font-semibold mt-6">Vercel</h3>
                <p>
                    Our application is hosted on Vercel. Vercel's Privacy Policy can be found at
                    <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 dark:text-blue-400 ml-1" target="_blank" rel="noopener noreferrer">
                        https://vercel.com/legal/privacy-policy
                    </a>.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Data Retention</h2>
                <p>
                    We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
                    We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes,
                    and enforce our policies.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to maintain the security of your personal information.
                    However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure,
                    and we cannot guarantee the absolute security of your data.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Your Rights</h2>
                <p>Depending on your location, you may have certain rights regarding your personal information:</p>
                <ul>
                    <li><strong>Access</strong>: You may request access to your personal information.</li>
                    <li><strong>Correction</strong>: You may request that we correct inaccurate information.</li>
                    <li><strong>Deletion</strong>: You may request that we delete your personal information.</li>
                    <li><strong>Restriction</strong>: You may request that we restrict the processing of your information.</li>
                    <li><strong>Data Portability</strong>: You may request a copy of your information in a structured, machine-readable format.</li>
                    <li><strong>Objection</strong>: You may object to our processing of your information.</li>
                </ul>
                <p>To exercise these rights, please contact us using the details provided in the "Contact Us" section.</p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Third-Party Services</h2>
                <p>
                    Our application may contain links to third-party websites or services that are not owned or controlled by us.
                    We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party
                    websites or services. We encourage you to review the privacy policies of all third-party websites you visit.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Children's Privacy</h2>
                <p>
                    Our application is not intended for use by children under the age of 13, and we do not knowingly collect personal
                    information from children under 13. If we learn we have collected or received personal information from a child under 13,
                    we will delete that information.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Changes to This Privacy Policy</h2>
                <p>
                    We may update our Privacy Policy from time to time. Any changes will be posted on this page, and the "Last Updated" date
                    at the top of this policy will be revised accordingly. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <ul>
                    <li><strong>Email</strong>: <a href="mailto:contact@danblock.dev" className="text-blue-600 dark:text-blue-400">contact@danblock.dev</a></li>
                </ul>
            </section>
        </div>
    );
}