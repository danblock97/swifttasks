import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({
                                               searchParams,
                                           }: {
    searchParams: { type?: string };
}) {
    // Await searchParams before accessing its properties
    const params = await searchParams;
    const accountType = params.type === "team" ? "team" : "single";

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
            <RegisterForm initialAccountType={accountType} />
        </div>
    );
}