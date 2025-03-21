import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage({
                                         searchParams,
                                     }: {
    searchParams: { type?: string };
}) {
    const accountType = searchParams.type === "team" ? "team" : "single";

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <RegisterForm initialAccountType={accountType} />
        </div>
    );
}