import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const Auth = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLogin, setIsLogin] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (error) console.error("Error getting session:", error);
			setUser(session?.user ?? null);
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleAuth = async () => {
		if (isLogin) {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) alert(error.message);
		} else {
			const { error } = await supabase.auth.signUp({ email, password });
			if (error) alert(error.message);
		}
	};

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) alert(error.message);
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
				<div>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<button
						onClick={handleAuth}
						className="w-full py-2 mb-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
					>
						{isLogin ? "Login" : "Sign Up"}
					</button>
					<button
						onClick={() => setIsLogin(!isLogin)}
						className="w-full py-2 font-semibold text-indigo-500 border border-indigo-500 rounded hover:bg-indigo-50"
					>
						{isLogin ? "Switch to Sign Up" : "Switch to Login"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Auth;
