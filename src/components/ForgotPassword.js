import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	const handleForgotPassword = async () => {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: "http://localhost:3000/reset-password",
		});
		if (error) {
			setMessage("Error: " + error.message);
		} else {
			setMessage("Password reset email sent!");
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
				<h2 className="text-2xl font-bold text-center">Forgot Password</h2>
				<div>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<button
						onClick={handleForgotPassword}
						className="w-full py-2 mb-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
					>
						Send Reset Link
					</button>
					{message && <p>{message}</p>}
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
