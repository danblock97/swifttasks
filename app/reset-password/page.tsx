import { ResetPasswordRequestForm } from "@/components/auth/reset-password-request-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password | SwiftTasks",
    description: "Reset your SwiftTasks account password",
};

export default function ResetPasswordPage() {
    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <ResetPasswordRequestForm />
        </div>
    );
}