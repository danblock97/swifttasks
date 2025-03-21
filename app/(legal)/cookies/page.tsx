// app/(legal)/cookies/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy | SwiftTasks",
    description: "Learn how SwiftTasks uses cookies and similar technologies",
};

export default function CookiePolicyPage() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: March 21, 2025</p>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Introduction</h2>
                <p>
                    This Cookie Policy explains how SwiftTasks ("we," "our," or "us") uses cookies and similar
                    technologies when you visit or interact with our web application. This policy should be read
                    alongside our Privacy Policy, which explains how we use personal information.
                </p>
                <p>
                    By continuing to use our application, you are agreeing to our use of cookies as described
                    in this Cookie Policy.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">What Are Cookies?</h2>
                <p>
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile)
                    when you visit a website or web application. They are widely used to make websites work more
                    efficiently, provide a better user experience, and give information to the owners of the site.
                </p>
                <p>
                    Cookies set by the website owner (in this case, SwiftTasks) are called "first-party cookies."
                    Cookies set by parties other than the website owner are called "third-party cookies." Third-party
                    cookies enable features or functionality to be provided on or through the website, such as analytics,
                    advertising, or social media functionality.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Types of Cookies We Use</h2>
                <p>We use different types of cookies for various reasons:</p>

                <h3 className="text-xl font-semibold mt-6">Essential Cookies</h3>
                <p>
                    These cookies are necessary for the application to function properly. They include cookies that
                    enable you to log into secure areas of our application or use essential features. You cannot
                    opt out of these cookies.
                </p>
                <p>Examples include:</p>
                <ul>
                    <li>Authentication cookies that verify your identity when you sign in</li>
                    <li>Session cookies that maintain your session while using our application</li>
                    <li>Security cookies that prevent fraudulent use</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Preference Cookies</h3>
                <p>
                    These cookies remember choices you make and provide enhanced, personalized features. They may
                    also be used to provide services you have requested.
                </p>
                <p>Examples include:</p>
                <ul>
                    <li>Theme preference (light/dark mode)</li>
                    <li>UI customizations (sidebar collapsed state)</li>
                    <li>Remembering your login details (if you select "Remember me")</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Analytical/Performance Cookies</h3>
                <p>
                    These cookies allow us to recognize and count the number of visitors to our application and
                    understand how users interact with it. This helps us improve how our application works.
                </p>
                <p>Examples include:</p>
                <ul>
                    <li>Tracking which features are most frequently used</li>
                    <li>Understanding how users navigate through the application</li>
                    <li>Identifying error pages or functionality issues</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Functionality Cookies</h3>
                <p>
                    These cookies allow our application to remember choices you make and provide enhanced features.
                </p>
                <p>Examples include:</p>
                <ul>
                    <li>Remembering your preferred language or region</li>
                    <li>Saving user preferences for future visits</li>
                </ul>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Specific Cookies We Use</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-700">
                        <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800">
                            <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Name</th>
                            <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Purpose</th>
                            <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Type</th>
                            <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Duration</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">swift_tasks_theme</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Stores your theme preference (light/dark/system)</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Preference</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">7 days</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">swift_tasks_remember_me</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Remembers if you selected "Remember me" at login</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Preference</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">30 days</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">swift_tasks_user_prefs</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Stores your application preferences</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Preference</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">7 days</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">swift_tasks_last_project</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Saves your last visited project</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Preference</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">7 days</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">swift_tasks_sidebar_collapsed</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Remembers if your sidebar was collapsed</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Preference</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">7 days</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">cookie_consent</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Records your cookie consent choice</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Essential</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">180 days</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">remembered_email</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Stores your email if "Remember me" is selected</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Preference</td>
                            <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">30 days</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Third-Party Cookies</h2>
                <p>
                    Our application may use services provided by third parties that set their own cookies.
                    These third parties include:
                </p>

                <h3 className="text-xl font-semibold mt-6">Supabase</h3>
                <p>
                    We use Supabase for authentication and data storage. Supabase may set cookies for authentication
                    and security purposes. For more information, please visit
                    <a href="https://supabase.com/privacy" className="text-blue-600 dark:text-blue-400 ml-1" target="_blank" rel="noopener noreferrer">
                        Supabase's Privacy Policy
                    </a>.
                </p>

                <h3 className="text-xl font-semibold mt-6">Vercel</h3>
                <p>
                    Our application is hosted on Vercel, which may use cookies for performance and analytics purposes.
                    For more information, please visit
                    <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 dark:text-blue-400 ml-1" target="_blank" rel="noopener noreferrer">
                        Vercel's Privacy Policy
                    </a>.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">How to Manage Cookies</h2>
                <p>
                    Most web browsers allow you to control cookies through their settings. These settings are
                    typically found in the "options" or "preferences" menu of your browser.
                </p>
                <p>You can usually:</p>
                <ul>
                    <li>See what cookies you have and delete them individually</li>
                    <li>Block third-party cookies</li>
                    <li>Block cookies from particular sites</li>
                    <li>Block all cookies</li>
                    <li>Delete all cookies when you close your browser</li>
                </ul>
                <p>
                    Please note that restricting cookies may impact the functionality of our application. For example,
                    if you block essential cookies, you may not be able to log in or use certain features.
                </p>

                <h3 className="text-xl font-semibold mt-6">Browser-Specific Instructions</h3>
                <ul>
                    <li><strong>Chrome</strong>: Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox</strong>: Options → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari</strong>: Preferences → Privacy → Cookies and website data</li>
                    <li><strong>Edge</strong>: Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Cookie Consent</h2>
                <p>
                    When you first visit our application, you will be shown a cookie banner that allows you to accept or
                    reject non-essential cookies. You can change your preferences at any time by clicking the "Cookie Settings"
                    link in the footer of our application.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Changes to This Cookie Policy</h2>
                <p>
                    We may update our Cookie Policy from time to time. The date at the top of this Cookie Policy indicates
                    when it was last updated. Any changes will become effective when we post the revised Cookie Policy.
                </p>
            </section>

            <section className="my-8">
                <h2 className="text-2xl font-semibold">Contact Us</h2>
                <p>If you have any questions about our use of cookies, please contact us at:</p>
                <ul>
                    <li><strong>Email</strong>: <a href="mailto:contact@danblock.dev" className="text-blue-600 dark:text-blue-400">contact@danblock.dev</a></li>
                </ul>
            </section>
        </div>
    );
}