import Link from "next/link";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
                {children}
            </div>
        </div>
    );
}