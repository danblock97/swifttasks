import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <Suspense fallback={
                <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">Loading login form...</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}