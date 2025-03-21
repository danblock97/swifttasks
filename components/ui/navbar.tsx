import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteNavbar() {
    return (
        <header className="border-b sticky top-0 bg-background/90 backdrop-blur-md z-50 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">SwiftTasks</div>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Features</Link>
                    <Link href="/pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Pricing</Link>
                    <Link href="/about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">About</Link>
                    <ThemeToggle />
                    <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                        Log in
                    </Link>
                    <Link href="/register">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
                    </Link>
                </nav>
                <div className="flex md:hidden items-center gap-4">
                    <ThemeToggle />
                    <Link href="/login" className="text-sm font-medium text-foreground/80">
                        Log in
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign up</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}