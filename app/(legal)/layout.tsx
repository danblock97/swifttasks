export default function LegalLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
                <div className="mx-auto max-w-3xl">
                    {children}
                </div>
        </div>
    );
}