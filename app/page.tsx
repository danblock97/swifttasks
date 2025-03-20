import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-bold text-xl">SwiftTasks</div>
            </div>
            <nav className="flex gap-4 items-center">
              <Link href="/login" className="text-sm font-medium hover:text-primary">
                Log in
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero section */}
          <section className="py-20 md:py-32">
            <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Task management,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                simplified
              </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                SwiftTasks helps you organize your personal and team tasks in one place,
                with intuitive tools for todos, kanban boards, and documentation.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Link href="/register?type=single">
                  <Button size="lg" className="px-8">Start Solo</Button>
                </Link>
                <Link href="/register?type=team">
                  <Button size="lg" variant="outline" className="px-8">Create Team</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features section */}
          <section className="py-16 bg-muted/50">
            <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-16">All-in-one task solution</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-background p-6 rounded-lg shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M8 2v4"></path>
                      <path d="M16 2v4"></path>
                      <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                      <path d="M3 10h18"></path>
                      <path d="M10 16h4"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Todo Lists</h3>
                  <p className="mt-2 text-muted-foreground">
                    Keep track of daily tasks with simple, effective todo lists that help you stay on top of priorities.
                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <rect width="7" height="7" x="3" y="3" rx="1"></rect>
                      <rect width="7" height="7" x="14" y="3" rx="1"></rect>
                      <rect width="7" height="7" x="14" y="14" rx="1"></rect>
                      <rect width="7" height="7" x="3" y="14" rx="1"></rect>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Kanban Boards</h3>
                  <p className="mt-2 text-muted-foreground">
                    Visualize project workflows with customizable kanban boards that help teams collaborate effectively.
                  </p>
                </div>
                <div className="bg-background p-6 rounded-lg shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Documentation Spaces</h3>
                  <p className="mt-2 text-muted-foreground">
                    Create and organize documentation for your projects, ensuring everyone has the information they need.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA section */}
          <section className="py-20">
            <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
              <h2 className="text-3xl font-bold">Ready to simplify your workflow?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of individuals and teams using SwiftTasks to stay organized and productive.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg">Get Started for Free</Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t py-8">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="font-semibold">SwiftTasks</div>
              <div className="text-sm text-muted-foreground mt-4 md:mt-0">
                © {new Date().getFullYear()} SwiftTasks. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}