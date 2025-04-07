"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

export function ResetPasswordUpdateForm() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isReset, setIsReset] = useState(false);
	const [isInvalidLink, setIsInvalidLink] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const supabase = createClientComponentClient();

	// Check if we have the necessary parameters to reset password
	useEffect(() => {
		// Wait for the component to be mounted before checking hash
		// This prevents hydration mismatches between server and client rendering
		if (typeof window !== "undefined") {
			// When the user clicks the reset link in their email, Supabase will redirect them
			// to this page with a token in the URL (#access_token=...)
			const hashParams = new URLSearchParams(window.location.hash.substring(1));

			if (!hashParams.has("access_token") && !hashParams.has("type")) {
				setIsInvalidLink(true);
			}
		}
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast({
				title: "Passwords don't match",
				description: "Please make sure your passwords match.",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) {
				throw error;
			}

			setIsReset(true);
			toast({
				title: "Password updated",
				description: "Your password has been successfully reset.",
			});

			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.message || "Failed to reset password. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}

	if (isInvalidLink) {
		return (
			<div className="max-w-md mx-auto relative">
				<div className="relative bg-card border border-red-100/60 dark:border-red-800/60 rounded-xl overflow-hidden shadow-md px-6 py-8">
					<div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>
					<div className="mb-6 text-center">
						<div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 mb-4">
							<div className="h-20 w-20 rounded-full flex items-center justify-center bg-red-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="40"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-white"
								>
									<path d="M18 6 6 18"></path>
									<path d="m6 6 12 12"></path>
								</svg>
							</div>
						</div>
						<h1 className="text-2xl font-bold tracking-tight">
							Invalid Reset Link
						</h1>
						<p className="text-sm text-muted-foreground mt-2 mb-6">
							This password reset link is invalid or has expired. Please request
							a new one.
						</p>
						<Link href="/reset-password">
							<Button className="w-full">Request New Reset Link</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto relative">
			{/* Decorative elements inspired by other pages */}
			<div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-400/20 via-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
			<div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 rounded-full blur-xl"></div>

			<div className="relative bg-card border border-teal-100/60 dark:border-teal-800/60 rounded-xl overflow-hidden shadow-md px-6 py-8">
				{/* Top gradient bar */}
				<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500"></div>

				<div className="mb-8 text-center">
					<div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/40 dark:to-blue-900/40 mb-4">
						<div className="h-20 w-20 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600">
							<ShieldCheck className="h-10 w-10 text-white" />
						</div>
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						Set new password
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{isReset
							? "Your password has been updated"
							: "Create a new secure password for your account"}
					</p>
				</div>

				{isReset ? (
					<div className="space-y-6">
						<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 text-center">
							<p className="text-sm text-green-800 dark:text-green-200">
								Your password has been successfully reset! You'll be redirected
								to login in a moment.
							</p>
						</div>
						<Link href="/login" className="w-full">
							<Button className="w-full h-12 font-medium text-base bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500">
								Continue to Login
							</Button>
						</Link>
					</div>
				) : (
					<form onSubmit={onSubmit} className="space-y-6">
						<div className="space-y-4">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-teal-500 dark:text-teal-400">
									<Lock className="h-5 w-5" />
								</div>
								<Input
									type="password"
									placeholder="New password"
									className="pl-10 border-teal-200/70 dark:border-teal-700/50 bg-teal-50/50 dark:bg-teal-900/20 focus:border-teal-400"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={8}
									disabled={isLoading}
								/>
							</div>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-teal-500 dark:text-teal-400">
									<Lock className="h-5 w-5" />
								</div>
								<Input
									type="password"
									placeholder="Confirm new password"
									className="pl-10 border-teal-200/70 dark:border-teal-700/50 bg-teal-50/50 dark:bg-teal-900/20 focus:border-teal-400"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={8}
									disabled={isLoading}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Password must be at least 8 characters long
							</p>
						</div>

						<Button
							type="submit"
							className="w-full h-12 font-medium text-base bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 hover:from-teal-600 hover:via-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Updating...
								</div>
							) : (
								<div className="flex items-center justify-center">
									Reset Password
									<ArrowRight className="ml-2 h-4 w-4" />
								</div>
							)}
						</Button>
					</form>
				)}

				<div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Remembered your password?{" "}
						<Link
							href="/login"
							className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
