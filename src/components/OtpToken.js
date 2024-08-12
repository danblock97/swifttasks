import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const OtpToken = () => {
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	const handleOtpToken = async (e) => {
		e.preventDefault();
		const otpToken = new URLSearchParams(window.location.search).get(
			"otp_token"
		);
		if (!otpToken) {
			setMessage("No OTP token provided.");
			return;
		}

		const { error } = await supabase.auth.verifyOtp(
			{ token: otpToken, type: "magiclink" },
			{ password }
		);
		if (error) {
			setMessage("Error: " + error.message);
		} else {
			setMessage("Password has been reset successfully.");
			navigate("/profile");
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
				<h2 className="text-2xl font-bold text-center">Enter New Password</h2>
				<form onSubmit={handleOtpToken}>
					<div>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="New Password"
							className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							type="submit"
							className="w-full py-2 mb-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
						>
							Reset Password
						</button>
					</div>
				</form>
				{message && <p>{message}</p>}
			</div>
		</div>
	);
};

export default OtpToken;
