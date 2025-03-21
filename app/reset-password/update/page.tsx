import { ResetPasswordUpdateForm } from "@/components/auth/reset-password-update-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Set New Password | SwiftTasks",
    description: "Set a new password for your SwiftTasks account",
};

export default function ResetPasswordUpdatePage() {
    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <ResetPasswordUpdateForm />
        </div>
    );
}