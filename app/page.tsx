import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export default async function HomePage() {
	const supabase = createServerComponentClient({ cookies });

	// Check if the user is authenticated
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// If the user is logged in, redirect to dashboard
	if (session) {
		redirect("/dashboard");
	}

	// Otherwise, render the landing page for non-authenticated users
	return (
		<main className="flex-1">
			{/* Hero section */}
			<section className="py-20 md:py-32 bg-background">
				<div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight">
						Task management,{" "}
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
							simplified
						</span>
					</h1>
					<p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
						SwiftTasks helps you organize your personal and team tasks in one
						place, with intuitive tools for todos, kanban boards, and
						documentation.
					</p>

					{/* Plan cards replacing buttons */}
					<div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						{/* Solo card */}
						<div className="flex flex-col h-full border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow hover:border-blue-200 bg-card">
							<div className="bg-blue-50 dark:bg-blue-900/30 p-6 border-b">
								<h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">
									Solo User
								</h3>
								<p className="text-muted-foreground mt-2">
									Perfect for personal task management
								</p>
							</div>
							<div className="p-6 flex flex-col flex-grow">
								<ul className="space-y-3 mb-8 flex-grow">
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>1 Personal Todo List</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>1 Project with 1 Kanban Board</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>1 Documentation Space with 5 Pages</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Unlimited Tasks</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Personal Calendar</span>
									</li>
								</ul>
								<Link href="/register?type=single" className="mt-auto w-full">
									<Button
										size="lg"
										className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors flex items-center justify-center gap-2"
									>
										Start Solo <ArrowRight className="h-5 w-5" />
									</Button>
								</Link>
							</div>
						</div>

						{/* Team card */}
						<div className="flex flex-col h-full border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow hover:border-teal-200 bg-card">
							<div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 p-6 border-b">
								<h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400">
									Team
								</h3>
								<p className="text-muted-foreground mt-2">
									Collaborate with your team efficiently
								</p>
							</div>
							<div className="p-6 flex flex-col flex-grow">
								<ul className="space-y-3 mb-8 flex-grow">
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Invite up to 5 Team Members</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>2 Project with 2 Kanban Boards</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>2 Documentation Space with 10 Pages</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>1 Todo List per Team Member</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Unlimited Tasks</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Team Calendar</span>
									</li>
								</ul>
								<Link href="/register?type=team" className="mt-auto w-full">
									<Button
										size="lg"
										className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium cursor-pointer transition-colors border-0 flex items-center justify-center gap-2"
									>
										Create Team <ArrowRight className="h-5 w-5" />
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features section */}
			<section className="py-20 bg-background dark:bg-background">
				<div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-4">
						All-in-one task solution
					</h2>
					<p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
						Everything you need to manage tasks efficiently, all in one
						integrated platform.
					</p>
					<div className="grid md:grid-cols-3 gap-8">
						{/* Todo Lists Card */}
						<div className="bg-card border border-indigo-100 dark:border-indigo-800/40 p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-700/60 transform hover:-translate-y-1">
							<div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center mb-6 mx-auto">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-indigo-600 dark:text-indigo-400"
								>
									<path d="M8 2v4"></path>
									<path d="M16 2v4"></path>
									<rect width="18" height="18" x="3" y="4" rx="2"></rect>
									<path d="M3 10h18"></path>
									<path d="M10 16h4"></path>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-center mb-3">
								Todo Lists
							</h3>
							<p className="text-muted-foreground text-center">
								Keep track of daily tasks with simple, effective todo lists that
								help you stay on top of priorities.
							</p>
							<div className="mt-6 pt-6 border-t border-indigo-50 dark:border-indigo-800/40">
								<ul className="space-y-2">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-indigo-500" />
										<span className="text-sm">Organize tasks by priority</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-indigo-500" />
										<span className="text-sm">Set due dates and reminders</span>
									</li>
								</ul>
							</div>
						</div>

						{/* Kanban Boards Card */}
						<div className="bg-card border border-blue-100 dark:border-blue-800/40 p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-700/60 transform hover:-translate-y-1">
							<div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center mb-6 mx-auto">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-blue-600 dark:text-blue-400"
								>
									<rect width="7" height="7" x="3" y="3" rx="1"></rect>
									<rect width="7" height="7" x="14" y="3" rx="1"></rect>
									<rect width="7" height="7" x="14" y="14" rx="1"></rect>
									<rect width="7" height="7" x="3" y="14" rx="1"></rect>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-center mb-3">
								Kanban Boards
							</h3>
							<p className="text-muted-foreground text-center">
								Visualize project workflows with customizable kanban boards that
								help teams collaborate effectively.
							</p>
							<div className="mt-6 pt-6 border-t border-blue-50 dark:border-blue-800/40">
								<ul className="space-y-2">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-blue-500" />
										<span className="text-sm">Visual workflow management</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-blue-500" />
										<span className="text-sm">
											Drag and drop task organization
										</span>
									</li>
								</ul>
							</div>
						</div>

						{/* Documentation Spaces Card */}
						<div className="bg-card border border-teal-100 dark:border-teal-800/40 p-6 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-teal-200 dark:hover:border-teal-700/60 transform hover:-translate-y-1">
							<div className="h-16 w-16 rounded-full bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center mb-6 mx-auto">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-teal-600 dark:text-teal-400"
								>
									<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-center mb-3">
								Documentation Spaces
							</h3>
							<p className="text-muted-foreground text-center">
								Create and organize documentation for your projects, ensuring
								everyone has the information they need.
							</p>
							<div className="mt-6 pt-6 border-t border-teal-50 dark:border-teal-800/40">
								<ul className="space-y-2">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-teal-500" />
										<span className="text-sm">Centralized knowledge base</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-teal-500" />
										<span className="text-sm">
											Easy sharing and collaboration
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA section */}
			<section className="py-24 bg-background border-t">
				<div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
					<div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border relative overflow-hidden">
						{/* Decorative elements */}
						<div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 dark:from-blue-900/20 to-teal-100/40 dark:to-teal-900/20 rounded-full -translate-y-1/3 translate-x-1/3"></div>
						<div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-100/40 dark:from-indigo-900/20 to-blue-100/40 dark:to-blue-900/20 rounded-full translate-y-1/3 -translate-x-1/3"></div>

						<div className="relative text-center">
							<h2 className="text-3xl md:text-4xl font-bold">
								Ready to simplify your workflow?
							</h2>
							<p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
								Join thousands of individuals and teams using SwiftTasks to stay
								organized and productive.
							</p>

							<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
								<Link href="/register?type=single">
									<Button
										size="lg"
										className="px-8 py-6 text-base bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors flex items-center justify-center gap-2"
									>
										Get Started Solo <ArrowRight className="h-5 w-5" />
									</Button>
								</Link>
								<Link href="/register?type=team">
									<Button
										size="lg"
										className="px-8 py-6 text-base bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium cursor-pointer transition-colors border-0 flex items-center justify-center gap-2"
									>
										Create a Team <ArrowRight className="h-5 w-5" />
									</Button>
								</Link>
							</div>

							<p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
								No credit card required. Free to start.
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
