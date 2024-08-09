import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Auth = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState(""); // New state for full name
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
						full_name: fullName, // Store full name in user_metadata
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
			<div className="flex items-center justify-center min-h-screen bg-gray-100">
				<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold text-center">
						Welcome, {user.email}
					</h2>
					<button
						onClick={handleLogout}
						className="w-full py-2 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
					>
						Logout
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
				<h2 className="text-2xl font-bold text-center">
					{isLogin ? "Login" : "Sign Up"}
				</h2>
				<form onSubmit={handleAuth}>
					{!isLogin && ( // Only show Full Name input for sign up
						<input
							type="text"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder="Full Name"
							className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
							required
						/>
					)}
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
						required
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
						required
					/>
					<button
						type="submit"
						className="w-full py-2 mb-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
					>
						{isLogin ? "Login" : "Sign Up"}
					</button>
				</form>
				<button
					onClick={() => setIsLogin(!isLogin)}
					className="w-full py-2 font-semibold text-indigo-500 border border-indigo-500 rounded hover:bg-indigo-50"
				>
					{isLogin ? "Switch to Sign Up" : "Switch to Login"}
				</button>
				{isLogin && (
					<div className="text-center mt-4">
						<Link
							to="/forgot-password"
							className="text-indigo-500 hover:underline"
						>
							Forgot Password?
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default Auth;
