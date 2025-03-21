import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Lightbulb, Zap, Coffee, Code, Target, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            A simpler approach to
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 ml-2">
                task management
              </span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                            SwiftTasks is a passion project built to solve the frustrations of overly complex task management tools.
                            Learn about the vision behind this project and where it's headed.
                        </p>
                    </div>
                </div>
            </section>

            {/* My Story Section */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-6">
                                The Vision
                            </div>
                            <h2 className="text-3xl font-bold mb-6">From frustration to solution</h2>
                            <p className="text-lg text-slate-600 mb-6">
                                SwiftTasks was born out of my personal frustration with existing task management tools.
                                As a developer, I found most solutions were either too simplistic or needlessly complex.
                                I wanted something in between—powerful enough for managing projects but still intuitive
                                and easy to use.
                            </p>
                            <p className="text-lg text-slate-600 mb-6">
                                I started building SwiftTasks for myself, focusing on creating a clean, user-friendly interface
                                with the essential features I needed daily. No bloat, no unnecessary complexity—just a
                                straightforward way to manage tasks, projects, and documentation in one place.
                            </p>
                            <p className="text-lg text-slate-600">
                                This project represents my belief that productivity tools should enhance focus, not
                                distract from it. They should be just complex enough to be useful, but simple enough
                                that they never get in the way of actual work.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Gradient background shape */}
                            <div className="absolute -z-10 w-full h-full rounded-3xl bg-gradient-to-br from-blue-50 via-white to-teal-50 transform rotate-3"></div>

                            {/* Development journey visualization */}
                            <div className="bg-card hover:shadow-md transition-all border-2 border-indigo-100 dark:border-indigo-900 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-xl shadow-lg p-8 relative">
                                <div className="mb-8 relative">
                                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center text-white">
                                        <div className="text-center">
                                            <Code className="h-16 w-16 mx-auto mb-3" />
                                            <div className="text-3xl font-bold">SwiftTasks</div>
                                            <div className="text-sm mt-1 opacity-80">In Development</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Development focus areas */}
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Simplicity First</h3>
                                            <p className="text-sm text-slate-600">Building with user experience as the top priority</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-teal-700">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Enhancing Productivity</h3>
                                            <p className="text-sm text-slate-600">Designing features that actually save time</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-700">
                                            <Coffee className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Solo Project with Passion</h3>
                                            <p className="text-sm text-slate-600">Developed with care and attention to detail</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Philosophy Section */}
            <section className="py-20 bg-gradient-to-r from-background to-secondary">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 font-medium text-sm mb-6">
                            Project Philosophy
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Principles that guide development</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            These core principles inform every decision in the development of SwiftTasks.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="border-2 border-blue-100 hover:border-blue-200 hover:shadow-md transition-all">
                            <CardContent className="pt-8">
                                <div className="flex justify-center mb-6">
                                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Zap className="h-7 w-7 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3">Simplicity</h3>
                                <p className="text-center text-slate-600">
                                    The best tools get out of your way. SwiftTasks is designed with an intuitive
                                    interface that doesn't require a manual to use.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-teal-100 hover:border-teal-200 hover:shadow-md transition-all">
                            <CardContent className="pt-8">
                                <div className="flex justify-center mb-6">
                                    <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center">
                                        <Target className="h-7 w-7 text-teal-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3">Focus</h3>
                                <p className="text-center text-slate-600">
                                    In a world full of distractions, SwiftTasks is built to help you focus on what matters.
                                    The interface promotes clarity and purposeful work.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-indigo-100 hover:border-indigo-200 hover:shadow-md transition-all">
                            <CardContent className="pt-8">
                                <div className="flex justify-center mb-6">
                                    <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <Code className="h-7 w-7 text-indigo-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-center mb-3">Craftsmanship</h3>
                                <p className="text-center text-slate-600">
                                    Every feature is carefully considered and implemented with attention to detail.
                                    Quality is prioritized over quantity.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-20 bg-background">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-6">
                            Behind the Scenes
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Built with modern technology</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            SwiftTasks leverages a powerful tech stack to deliver a responsive, reliable experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Tech 1 */}
                        <div className="text-center">
                            <div className="mb-4 mx-auto rounded-lg overflow-hidden h-20 w-20 bg-slate-50 flex items-center justify-center border">
                                <svg viewBox="0 0 28 28" className="h-12 w-12">
                                    <path d="M14 0C6.27 0 0 6.27 0 14s6.27 14 14 14 14-6.27 14-14S21.73 0 14 0zm0 7.52c3.58 0 6.48 2.9 6.48 6.48s-2.9 6.48-6.48 6.48-6.48-2.9-6.48-6.48S10.42 7.52 14 7.52z" fill="#000" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Next.js</h3>
                            <p className="text-sm text-slate-600 max-w-xs mx-auto">
                                For a fast, optimized frontend experience with server-side rendering capabilities.
                            </p>
                        </div>

                        {/* Tech 2 */}
                        <div className="text-center">
                            <div className="mb-4 mx-auto rounded-lg overflow-hidden h-20 w-20 bg-slate-50 flex items-center justify-center border">
                                <svg viewBox="0 0 24 24" className="h-12 w-12">
                                    <path d="M12 6.36l.42 1.78 1.63.13-1.25 1.17.38 1.8L12 10.29l-1.18.95.38-1.8-1.25-1.17 1.63-.13L12 6.36M21 9h-8V7h8v2m0 2h-8v2h8v-2m0 4h-8v2h8v-2M3 7l1.5 4.5L8 7m-5 12.5L4.5 15 6 19.5" fill="#7E57C2"/>
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Supabase</h3>
                            <p className="text-sm text-slate-600 max-w-xs mx-auto">
                                For authentication, database management, and real-time features.
                            </p>
                        </div>

                        {/* Tech 3 */}
                        <div className="text-center">
                            <div className="mb-4 mx-auto rounded-lg overflow-hidden h-20 w-20 bg-slate-50 flex items-center justify-center border">
                                <svg viewBox="0 0 24 24" className="h-12 w-12">
                                    <path d="M18.5 9.51a4.22 4.22 0 0 1-1.91-1.34A5.77 5.77 0 0 0 12 6a4.72 4.72 0 0 0-5 4 3.23 3.23 0 0 1 3.5-1.49 4.32 4.32 0 0 1 1.91 1.35A5.77 5.77 0 0 0 17 12a4.72 4.72 0 0 0 5-4 3.2 3.2 0 0 1-3.5 1.51zm-13 4.98a4.22 4.22 0 0 1 1.91 1.34A5.77 5.77 0 0 0 12 18a4.72 4.72 0 0 0 5-4 3.23 3.23 0 0 1-3.5 1.49 4.32 4.32 0 0 1-1.91-1.35A5.8 5.8 0 0 0 7 12a4.72 4.72 0 0 0-5 4 3.2 3.2 0 0 1 3.5-1.51z" fill="#38BDF8" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">Tailwind CSS</h3>
                            <p className="text-sm text-slate-600 max-w-xs mx-auto">
                                For a utility-first approach to styling that enables rapid UI development.
                            </p>
                        </div>

                        {/* Tech 4 */}
                        <div className="text-center">
                            <div className="mb-4 mx-auto rounded-lg overflow-hidden h-20 w-20 bg-slate-50 flex items-center justify-center border">
                                <svg viewBox="0 0 24 24" className="h-12 w-12">
                                    <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" fill="#61DAFB" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">React</h3>
                            <p className="text-sm text-slate-600 max-w-xs mx-auto">
                                For building a responsive, component-based user interface.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Status & Roadmap Section */}
            <section className="py-20 bg-gradient-to-b from-background to-secondary">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-6">
                            Project Status
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Where SwiftTasks is headed</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            SwiftTasks is currently in active development with these milestones on the horizon.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-card hover:shadow-md transition-all border-blue-100 dark:border-blue-900 hover:border-blue-200 dark:hover:border-blue-800 rounded-lg p-6 border shadow-sm">
                            <div className="mb-6">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                    <Code className="h-5 w-5 text-blue-700" />
                                </div>
                                <h3 className="text-xl font-semibold">Current Development</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Authentication System</span>
                                        <p className="text-sm text-slate-600 mt-1">User registration, login, and account management</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Core Todo Functionality</span>
                                        <p className="text-sm text-slate-600 mt-1">Creating, editing, and completing tasks</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Kanban Board Interface</span>
                                        <p className="text-sm text-slate-600 mt-1">Drag-and-drop task management with customizable columns</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Documentation Spaces</span>
                                        <p className="text-sm text-slate-600 mt-1">Rich text editor for creating project documentation</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Team Collaboration</span>
                                        <p className="text-sm text-slate-600 mt-1">Invite team members and collaborate on projects</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-card hover:shadow-md transition-all border-blue-100 dark:border-blue-900 hover:border-blue-200 dark:hover:border-blue-800 rounded-lg p-6 border shadow-sm">
                            <div className="mb-6">
                                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                                    <Target className="h-5 w-5 text-indigo-700" />
                                </div>
                                <h3 className="text-xl font-semibold">Future Roadmap</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Advanced Analytics</span>
                                        <p className="text-sm text-slate-600 mt-1">Insights into productivity patterns and team performance</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Expanded Storage Limits</span>
                                        <p className="text-sm text-slate-600 mt-1">Increased document storage and attachment capabilities</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Enhanced Team Tools</span>
                                        <p className="text-sm text-slate-600 mt-1">Improved team permissions, roles, and collaboration features</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">API Access</span>
                                        <p className="text-sm text-slate-600 mt-1">Integration capabilities with other tools and services</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">Mobile Applications</span>
                                        <p className="text-sm text-slate-600 mt-1">Native mobile experience for iOS and Android</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* About the Developer Section */}
            <section className="py-20 bg-gradient-to-r from-background to-secondary">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative order-2 md:order-1">
                            <div className="bg-card hover:shadow-md transition-all border-2 border-indigo-100 dark:border-indigo-900 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-2xl shadow-xl p-8">
                                <div className="flex justify-center mb-8">
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                                        <Code className="h-12 w-12 text-white" />
                                    </div>
                                </div>

                                <blockquote className="text-lg italic text-slate-600 mb-8 text-center">
                                    "I believe task management tools should be powerful enough to handle complex projects,
                                    yet simple enough that they never distract from the work itself."
                                </blockquote>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Coffee className="h-4 w-4 text-blue-700" />
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Full-stack developer</span> with a passion for user experience
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                            <Heart className="h-4 w-4 text-teal-700" />
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Passionate about</span> productivity tools and workflows
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <Lightbulb className="h-4 w-4 text-indigo-700" />
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Dedicated to</span> creating intuitive, user-friendly software
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-teal-100/50 rounded-full -z-10"></div>
                            <div className="absolute -left-6 -top-6 w-24 h-24 bg-gradient-to-tr from-indigo-100/50 to-blue-100/50 rounded-full -z-10"></div>
                        </div>

                        <div className="order-1 md:order-2">
                            <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium text-sm mb-6">
                                About the Developer
                            </div>
                            <h2 className="text-3xl font-bold mb-6">Why I'm building SwiftTasks</h2>
                            <p className="text-lg text-slate-600 mb-6">
                                As a developer, I've spent years using various productivity tools—some were too simple,
                                others overwhelmingly complex. SwiftTasks represents my vision for the perfect balance:
                                a tool that's powerful when you need it, and invisible when you don't.
                            </p>
                            <p className="text-lg text-slate-600 mb-6">
                                This project combines my technical expertise with my personal frustrations as a user.
                                Every feature is designed with intention, addressing actual pain points rather than
                                adding complexity for its own sake.
                            </p>
                            <p className="text-lg text-slate-600">
                                I'm developing SwiftTasks in the open, iterating based on feedback and real-world use.
                                My goal is to create something I would want to use every day—and hopefully, you will too.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28 bg-background">
                <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden text-white">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3"></div>

                        <div className="relative text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the journey</h2>
                            <p className="mt-4 text-lg max-w-2xl mx-auto mb-8 text-white/90">
                                SwiftTasks is just getting started. Sign up to be among the first to experience
                                a new approach to task management and follow the development progress.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register?type=single">
                                    <Button size="lg" className="px-8 py-6 text-base bg-white text-blue-600 hover:bg-blue-50 font-medium cursor-pointer transition-colors flex items-center justify-center gap-2">
                                        Get Early Access <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/features">
                                    <Button size="lg" className="px-8 py-6 text-base bg-blue-400/30 hover:bg-blue-400/40 text-white border-white/20 font-medium cursor-pointer transition-colors flex items-center justify-center gap-2">
                                        Explore Features <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}