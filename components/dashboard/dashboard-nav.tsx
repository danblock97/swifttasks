"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Sidebar } from "./sidebar";

export function DashboardNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const mainNavItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            title: "Todo Lists",
            href: "/dashboard/todo",
            active: pathname.startsWith("/dashboard/todo"),
        },
        {
            title: "Projects",
            href: "/dashboard/projects",
            active: pathname.startsWith("/dashboard/projects"),
        },
        {
            title: "Documentation",
            href: "/dashboard/docs",
            active: pathname.startsWith("/dashboard/docs"),
        },
    ];

    return (
        <div className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                    <div className="px-7">
                        <Link
                            href="/"
                            className="flex items-center"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="font-bold">SwiftTasks</span>
                        </Link>
                    </div>
                    <Sidebar className="px-2 py-6" />
                </SheetContent>
            </Sheet>
            <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
                    {mainNavItems.map((item) => (
                        <NavigationMenuItem key={item.href}>
                            <Link href={item.href} legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        "text-sm",
                                        item.active && "bg-accent"
                                    )}
                                >
                                    {item.title}
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}