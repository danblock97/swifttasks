import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function Pricing() {
    return (
        <>
            {/* Hero section */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
                <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-6">
                        Early Access Promotion
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                        SwiftTasks is currently <span className="font-semibold">free for everyone</span> during our early access period. Experience all features without any cost.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                        <Link href="/register?type=single">
                            <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">Start for free</Button>
                        </Link>
                        <Link href="/register?type=team">
                            <Button size="lg" variant="outline" className="px-8">Create team</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing cards */}
            <section className="py-16 md:py-24">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold">Choose your plan</h2>
                        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                            All plans are currently free during our early access period. We'll provide advance notice before introducing paid features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {/* Solo Plan */}
                        <div className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 border-b bg-blue-50">
                                <h3 className="text-xl font-bold text-slate-900">Solo</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">Free</span>
                                    <span className="ml-1 text-xl font-semibold text-slate-500">/forever</span>
                                </div>
                                <p className="mt-5 text-sm text-slate-500">
                                    Perfect for individual productivity and personal projects.
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Personal Todo List</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Project</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Kanban Board</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Documentation Space (5 pages)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Unlimited Tasks</span>
                                    </li>
                                    <li className="flex items-start">
                                        <X className="h-5 w-5 text-slate-300 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-500">Team Collaboration</span>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link href="/register?type=single" className="w-full">
                                        <Button size="lg" className="w-full">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Team Plan */}
                        <div className="border rounded-xl overflow-hidden bg-white shadow-lg relative transform md:scale-105 z-10">
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 to-blue-600"></div>
                            <div className="absolute top-5 right-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Popular
                </span>
                            </div>
                            <div className="p-6 border-b bg-gradient-to-r from-teal-50 to-blue-50">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Team</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">Free</span>
                                    <span className="ml-1 text-xl font-semibold text-slate-500">/beta period</span>
                                </div>
                                <p className="mt-5 text-sm text-slate-500">
                                    Collaborate efficiently with your team members.
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Invite up to 5 Team Members</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Project</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">2 Kanban Boards</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Documentation Space (10 pages)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">1 Todo List per Team Member</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Team Collaboration</span>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Link href="/register?type=team" className="w-full">
                                        <Button size="lg" className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Future Pro Plan (Coming Soon) */}
                        <div className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow relative opacity-75">
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                <span className="px-4 py-2 rounded-full border-2 border-blue-500 text-blue-600 font-bold text-sm">Coming Soon</span>
                            </div>
                            <div className="p-6 border-b bg-indigo-50">
                                <h3 className="text-xl font-bold text-slate-900">Pro</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">$9</span>
                                    <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                                </div>
                                <p className="mt-5 text-sm text-slate-500">
                                    Advanced features for power users and growing teams.
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Unlimited Team Members</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Unlimited Projects</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Unlimited Kanban Boards</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Advanced Reporting</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">Priority Support</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-slate-700">API Access</span>
                                    </li>
                                </ul>
                                <div className="mt-8">
                                    <Button size="lg" className="w-full" disabled>Join Waitlist</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-slate-50">
                <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">How long will SwiftTasks remain free?</h3>
                            <p className="mt-2 text-slate-600">
                                SwiftTasks is free during our early access period. We're committed to providing value before introducing any paid tiers. When we decide to introduce paid plans, all existing users will receive at least 30 days notice.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">What happens to my data if paid plans are introduced?</h3>
                            <p className="mt-2 text-slate-600">
                                Your data will always remain yours. If we introduce paid plans, current users will have the option to either maintain their existing free tier or upgrade for additional features. We will never force you to pay for access to data you've already created.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">Can I upgrade my account later?</h3>
                            <p className="mt-2 text-slate-600">
                                Yes! When paid tiers become available, you'll be able to seamlessly upgrade your account to access additional features and capacity.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">Is there a limit to how many tasks I can create?</h3>
                            <p className="mt-2 text-slate-600">
                                No, all plans include unlimited tasks. The main difference between plans is the number of projects, boards, and team members you can have.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-blue-50 via-white to-teal-50">
                <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100/60 relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-teal-100/40 rounded-full -translate-y-1/3 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full translate-y-1/3 -translate-x-1/3"></div>

                        <div className="relative">
                            <h2 className="text-3xl font-bold mb-4">Start using SwiftTasks today</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                                Join thousands of users who are already organizing their work and life with SwiftTasks.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register?type=single">
                                    <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">Create Free Account</Button>
                                </Link>
                                <Link href="/login">
                                    <Button size="lg" variant="outline" className="px-8">Sign In</Button>
                                </Link>
                            </div>

                            <p className="mt-6 text-sm text-slate-500">No credit card required</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}