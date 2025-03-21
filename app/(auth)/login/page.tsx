import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <LoginForm />
        </div>
    );
}