import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="text-muted-foreground">
                    We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
                </p>
            </div>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Link href="/login">
                    <Button variant="outline">Back to Login</Button>
                </Link>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
                <p>
                    Didn&apos;t receive an email?{" "}
                    <Link href="/resend-verification" className="underline underline-offset-4 hover:text-primary">
                        Click here to resend
                    </Link>
                </p>
            </div>
        </div>
    );
}