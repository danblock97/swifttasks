import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

interface SearchParamsProps {
    searchParams: Promise<{ type?: string }>;
}

export default async function RegisterPage({ searchParams }: SearchParamsProps) {
    // Resolve the promise to get the actual parameters
    const params = await searchParams;
    const accountType = params.type === "team" ? "team" : "single";

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <RegisterForm initialAccountType={accountType} />
        </div>
    );
}