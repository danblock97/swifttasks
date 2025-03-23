import { Suspense } from "react";
import { ResetPasswordUpdateForm } from "@/components/auth/reset-password-update-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Set New Password | SwiftTasks",
    description: "Set a new password for your SwiftTasks account",
};

export default function ResetPasswordUpdatePage() {
    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <Suspense fallback={
                <div className="text-center p-4">
                    <p className="text-sm text-muted-foreground">Loading password reset form...</p>
                </div>
            }>
                <ResetPasswordUpdateForm />
            </Suspense>
        </div>
    );
}