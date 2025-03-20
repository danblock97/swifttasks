import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage({
                                         searchParams,
                                     }: {
    searchParams: { type?: string };
}) {
    const accountType = searchParams.type === "team" ? "team" : "single";

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    {accountType === "team"
                        ? "Create a team account to collaborate with others"
                        : "Create an account to manage your tasks"}
                </p>
            </div>
            <RegisterForm initialAccountType={accountType} />
            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="hover:text-brand underline underline-offset-4"
                >
                    Already have an account? Sign In
                </Link>
            </p>
        </div>
    );
}