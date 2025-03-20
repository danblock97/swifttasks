import Link from "next/link";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="container flex h-14 items-center py-4">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl">SwiftTasks</span>
                </Link>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
                {children}
            </div>
        </div>
    );
}