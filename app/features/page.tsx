import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {Check, ArrowRight, CheckCircle2, Kanban, FileText, Users, Clock, Plus} from "lucide-react";

export default function FeaturesPage() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            All the features you need to
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 ml-2">
                                stay organized
                            </span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                            SwiftTasks combines powerful tools for personal productivity and team collaboration in one
                            streamlined platform. Discover how our features help you accomplish more, together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature Overview Section */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need, nothing you don't</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            SwiftTasks is designed to be powerful yet simple, giving you just the right tools to
                            manage your tasks efficiently without overwhelming you with complexity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Todo Lists Feature */}
                        <Card className="flex flex-col h-full bg-card hover:shadow-md transition-all border-2 border-indigo-100 dark:border-indigo-900 hover:border-indigo-200 dark:hover:border-indigo-800">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>
                                <CardTitle className="text-center text-xl mb-2">Todo Lists</CardTitle>
                                <CardDescription className="text-center">
                                    Keep track of your tasks with simple, effective todo lists
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3 mt-4">
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Create tasks with due dates and priorities</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Mark tasks as complete and track progress</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Filter tasks by priority, status, and due date</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Get a quick overview of your most important tasks</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Kanban Boards Feature */}
                        <Card className="flex flex-col h-full bg-card hover:shadow-md transition-all border-2 border-blue-100 dark:border-blue-900 hover:border-blue-200 dark:hover:border-blue-800">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                                        <Kanban className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <CardTitle className="text-center text-xl mb-2">Kanban Boards</CardTitle>
                                <CardDescription className="text-center">
                                    Visualize your workflow with customizable kanban boards
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3 mt-4">
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Drag and drop tasks between workflow columns</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Assign tasks to team members for collaboration</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Customize columns to match your unique workflow</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Track project progress visually at a glance</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Documentation Feature */}
                        <Card className="flex flex-col h-full bg-card hover:shadow-md transition-all border-2 border-teal-100 dark:border-teal-900 hover:border-teal-200 dark:hover:border-teal-800">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="h-16 w-16 rounded-full bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                                    </div>
                                </div>
                                <CardTitle className="text-center text-xl mb-2">Documentation Spaces</CardTitle>
                                <CardDescription className="text-center">
                                    Create and organize documentation for your projects
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3 mt-4">
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Create rich documentation with formatting options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Organize docs in a structured, searchable space</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Share knowledge and information with your team</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Keep all project documentation in one place</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Team Collaboration Section */}
            <section className="py-20 bg-gradient-to-r from-secondary to-accent">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium text-sm mb-6">
                                Team Collaboration
                            </div>
                            <h2 className="text-3xl font-bold mb-6">Work better together</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-500 mb-6">
                                SwiftTasks makes team collaboration seamless and effective. Share projects,
                                assign tasks, and keep everyone on the same page with our powerful
                                team features.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-2">
                                    <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <Users className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <span className="font-medium block mb-1">Team Workspaces</span>
                                        <span className="text-slate-600 dark:text-slate-500 text-sm">Create dedicated spaces for your team to collaborate on projects</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <Check className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <span className="font-medium block mb-1">Task Assignment</span>
                                        <span className="text-slate-600 dark:text-slate-500 text-sm">Assign tasks to team members and track ownership</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <FileText className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <span className="font-medium block mb-1">Shared Documentation</span>
                                        <span className="text-slate-600 dark:text-slate-500 text-sm">Create and share knowledge bases with your entire team</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="bg-card rounded-lg shadow-xl p-8 border border-blue-100 dark:border-blue-900">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex -space-x-2">
                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">JD</div>
                                        <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">AR</div>
                                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">KL</div>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">Marketing Campaign</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">3 team members</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">Tasks Progress</h4>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">8/12 completed</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '66%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-md">
                                        <Checkbox className="h-5 w-5 rounded-sm bg-card" checked={true} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm line-through text-slate-500 dark:text-slate-700">Create content calendar</p>
                                            <div className="flex items-center mt-1 gap-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-700">Completed by JD</span>
                                                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Done</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-md">
                                        <Checkbox className="h-5 w-5 rounded-sm" checked={false} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Design social media graphics</p>
                                            <div className="flex items-center mt-1 gap-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-500">Assigned to AR</span>
                                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">In Progress</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-md">
                                        <Checkbox className="h-5 w-5 rounded-sm" checked={false} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Review campaign analytics</p>
                                            <div className="flex items-center mt-1 gap-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-500">Due in 2 days</span>
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">To Do</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-blue-100/50 dark:from-blue-900/30 to-teal-100/50 dark:to-teal-900/30 rounded-full -z-10"></div>
                            <div className="absolute -left-6 -top-6 w-24 h-24 bg-gradient-to-tr from-indigo-100/50 dark:from-indigo-900/30 to-blue-100/50 dark:to-blue-900/30 rounded-full -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Personal Productivity Section */}
            <section className="py-20 bg-background">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative order-2 md:order-1">
                            <div className="bg-card rounded-lg shadow-xl p-8 border border-indigo-100 dark:border-indigo-900">
                                <div className="mb-6">
                                    <h4 className="font-medium mb-1">My Dashboard</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Wednesday, March 20, 2025</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-indigo-50 dark:bg-indigo-950/50 rounded-lg p-4">
                                        <h5 className="text-xs text-indigo-600 dark:text-indigo-600 font-medium mb-2">Tasks</h5>
                                        <p className="text-2xl font-bold">7</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-700 mt-1">3 due today</p>
                                    </div>
                                    <div className="bg-teal-50 dark:bg-teal-950/50 rounded-lg p-4">
                                        <h5 className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-2">Projects</h5>
                                        <p className="text-2xl font-bold">2</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-700 mt-1">1 updated</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <h4 className="font-medium mb-3">Today's Tasks</h4>

                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-md">
                                        <Checkbox className="h-5 w-5 rounded-sm" checked={false} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Prepare client presentation</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Due in 3 hours
                                                </span>
                                                <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">High</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-md">
                                        <Checkbox className="h-5 w-5 rounded-sm" checked={false} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Schedule team meeting</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-slate-500 dark:text-slate-700 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Due today
                                                </span>
                                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">Medium</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-md">
                                        <Checkbox className="h-5 w-5 rounded-sm" checked={false} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Review monthly goals</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-slate-500 dark:text-slate-700 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Due today
                                                </span>
                                                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Low</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Button variant="outline" size="sm">View All Tasks</Button>
                                    <Button size="sm">
                                        <Plus className="mr-1 h-4 w-4" />
                                        Add Task
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-indigo-100/50 dark:from-indigo-900/30 to-purple-100/50 dark:to-purple-900/30 rounded-full -z-10"></div>
                            <div className="absolute -left-6 -top-6 w-24 h-24 bg-gradient-to-tr from-teal-100/50 dark:from-teal-900/30 to-indigo-100/50 dark:to-indigo-900/30 rounded-full -z-10"></div>
                        </div>

                        <div className="order-1 md:order-2">
                            <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-6">
                                Personal Productivity
                            </div>
                            <h2 className="text-3xl font-bold mb-6">Stay on top of your tasks</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-500 mb-6">
                                SwiftTasks helps you organize your personal work and life tasks with powerful
                                tools designed for individual productivity.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-2">
                                    <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-300" />
                                    </div>
                                    <div>
                                        <span className="font-medium block mb-1">Personal Dashboard</span>
                                        <span className="text-slate-600 dark:text-slate-500 text-sm">Get a quick overview of your tasks and priorities</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <Clock className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-300" />
                                    </div>
                                    <div>
                                        <span className="font-medium block mb-1">Due Dates & Priorities</span>
                                        <span className="text-slate-600 dark:text-slate-500 text-sm">Never miss a deadline with task prioritization</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                        <Kanban className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-300" />
                                    </div>
                                    <div>
                                        <span className="font-medium block mb-1">Visual Organization</span>
                                        <span className="text-slate-600 dark:text-slate-500 text-sm">Organize your work visually with personal kanban boards</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Management Section */}
            <section className="py-20 bg-gradient-to-b from-background to-secondary">
                <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium text-sm mb-6">
                            Project Management
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Manage projects from start to finish</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Keep your projects organized, on-track, and moving forward with SwiftTasks'
                            comprehensive project management features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all">
                                <div className="mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                        <Kanban className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Multiple Project Boards</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-500">
                                    Create multiple project boards with different kanban structures to
                                    organize various aspects of your work. Customize columns and workflows
                                    to match each project's unique needs.
                                </p>
                            </div>

                            <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all">
                                <div className="mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4">
                                        <Users className="h-5 w-5 text-teal-700 dark:text-teal-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Team Collaboration</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-500">
                                    Invite team members to your projects, assign tasks, and track progress together.
                                    Team projects make it easy to distribute work and keep everyone informed.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all">
                                <div className="mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                                        <FileText className="h-5 w-5 text-indigo-700 dark:text-indigo-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Project Documentation</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-500">
                                    Keep all project-related documentation in one place. Create documentation
                                    spaces for each project to store important information, guidelines, and resources.
                                </p>
                            </div>

                            <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all">
                                <div className="mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                                        <Clock className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Progress Tracking</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-500">
                                    Track project progress with visual indicators and status updates. See how
                                    your projects are advancing at a glance and identify bottlenecks before they become problems.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28 bg-gradient-to-r from-secondary via-background to-accent">
                <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
                    <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border border-blue-100/60 dark:border-blue-800/60 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 dark:from-blue-900/40 to-teal-100/40 dark:to-teal-900/40 rounded-full -translate-y-1/3 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-100/40 dark:from-indigo-900/40 to-blue-100/40 dark:to-blue-900/40 rounded-full translate-y-1/3 -translate-x-1/3"></div>

                        <div className="relative text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to boost your productivity?</h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                                Start organizing your tasks, collaborating with your team, and getting more
                                done with SwiftTasks. Join thousands of users who are already using our platform.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register?type=single">
                                    <Button size="lg" className="px-8 py-6 text-base bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer transition-colors flex items-center justify-center gap-2">
                                        Get Started Solo <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/register?type=team">
                                    <Button size="lg" className="px-8 py-6 text-base bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium cursor-pointer transition-colors border-0 flex items-center justify-center gap-2">
                                        Create a Team <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>

                            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No credit card required. Free to start.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

// Missing component for the visual mockup, let's define it
interface CheckboxProps {
    className?: string;
    checked?: boolean;
}

const Checkbox = ({ className, checked = false }: CheckboxProps) => {
    return (
        <div className={`border ${checked ? 'bg-blue-600 border-blue-600' : 'bg-card border-slate-300 dark:border-slate-700'} rounded flex items-center justify-center ${className}`}>
            {checked && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )}
        </div>
    );
};