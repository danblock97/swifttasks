import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Transition } from "@headlessui/react";

const Auth = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [isLogin, setIsLogin] = useState(true);
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session) {
				setUser(session.user);
				navigate("/tasks");
			}
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			if (session) navigate("/tasks");
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [navigate]);

	const handleAuth = async (e) => {
		e.preventDefault();
		const authAction = isLogin ? signInWithRetries : signUpWithRetries;
		await authAction(email, password, fullName);
	};

	const signInWithRetries = async (email, password, retries = 5) => {
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) {
				if (error.status === 429 && retries > 0) {
					setTimeout(
						() => signInWithRetries(email, password, retries - 1),
						2 ** (5 - retries) * 1000
					);
				} else {
					throw error;
				}
			} else {
				toast.success("Logged in successfully");
				navigate("/tasks");
			}
		} catch (error) {
			toast.error(`Error logging in: ${error.message}`);
		}
	};

	const signUpWithRetries = async (email, password, fullName, retries = 5) => {
		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
					},
				},
			});

			if (error) {
				if (error.status === 429 && retries > 0) {
					setTimeout(
						() => signUpWithRetries(email, password, fullName, retries - 1),
						2 ** (5 - retries) * 1000
					);
				} else {
					throw error;
				}
			} else {
				toast.success(
					"Sign up successful, please check your email to confirm."
				);
				navigate("/verify-email");
			}
		} catch (error) {
			toast.error(`Error signing up: ${error.message}`);
		}
	};

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) toast.error(error.message);
		else toast.success("Logged out successfully");
	};

	if (user) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
				<div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold text-center dark:text-gray-300">
						Welcome, {user.email}
					</h2>
					<button
						onClick={handleLogout}
						className="w-full py-2 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600 transition duration-200"
					>
						Logout
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<Transition
				show={!user}
				enter="transform transition duration-[400ms]"
				enterFrom="opacity-0 rotate-[-120deg] scale-50"
				enterTo="opacity-100 rotate-0 scale-100"
				leave="transform duration-200 transition ease-in-out"
				leaveFrom="opacity-100 rotate-0 scale-100"
				leaveTo="opacity-0 scale-95"
			>
				<div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
					<h2 className="text-3xl font-extrabold text-center text-indigo-600 dark:text-indigo-400">
						{isLogin ? "SwiftTasks Login" : "SwiftTasks Sign Up"}
					</h2>
					<form onSubmit={handleAuth} className="space-y-6">
						{!isLogin && (
							<div className="relative">
								<input
									type="text"
									id="fullName"
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-transparent border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 peer"
									placeholder="Full Name"
									required
								/>
								<label
									htmlFor="fullName"
									className="absolute left-3 top-0 px-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 transition-all transform -translate-y-3 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2 peer-focus:scale-75 peer-focus:-translate-y-3"
								>
									Full Name
								</label>
							</div>
						)}
						<div className="relative">
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-transparent border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 peer"
								placeholder="Email"
								required
							/>
							<label
								htmlFor="email"
								className="absolute left-3 top-0 px-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 transition-all transform -translate-y-3 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2 peer-focus:scale-75 peer-focus:-translate-y-3"
							>
								Email
							</label>
						</div>
						<div className="relative">
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-transparent border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 peer"
								placeholder="Password"
								required
							/>
							<label
								htmlFor="password"
								className="absolute left-3 top-0 px-1 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 transition-all transform -translate-y-3 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2 peer-focus:scale-75 peer-focus:-translate-y-3"
							>
								Password
							</label>
						</div>
						<button
							type="submit"
							className="w-full py-2 font-semibold text-white bg-indigo-500 dark:bg-indigo-600 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition duration-200"
						>
							{isLogin ? "Login" : "Sign Up"}
						</button>
					</form>
					<div className="text-center mt-4">
						{isLogin ? (
							<p className="text-gray-600 dark:text-gray-400">
								Don't have an account?{" "}
								<span
									onClick={() => setIsLogin(false)}
									className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline"
								>
									Sign up Now!
								</span>
							</p>
						) : (
							<p className="text-gray-600 dark:text-gray-400">
								Already have an account?{" "}
								<span
									onClick={() => setIsLogin(true)}
									className="text-indigo-500 dark:text-indigo-400 cursor-pointer hover:underline"
								>
									Login Here!
								</span>
							</p>
						)}
					</div>
					{isLogin && (
						<div className="text-center mt-2">
							<Link
								to="/forgot-password"
								className="text-indigo-500 dark:text-indigo-400 hover:underline"
							>
								Forgot Password?
							</Link>
						</div>
					)}
					<div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
						By authenticating with SwiftTasks, you agree to our{" "}
						<Link
							to="/terms-of-service"
							className="text-indigo-500 dark:text-indigo-400 hover:underline"
						>
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link
							to="/privacy-policy"
							className="text-indigo-500 dark:text-indigo-400 hover:underline"
						>
							Privacy Policy
						</Link>
						.
					</div>
				</div>
			</Transition>
		</div>
	);
};

export default Auth;
