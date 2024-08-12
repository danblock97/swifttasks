import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	const handleSendOtp = async () => {
		try {
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: "http://localhost:3000/otp-token", // Adjust your redirect URL as needed
					shouldCreateUser: false, // Ensure that no new user is created
				},
			});

			if (error) {
				setMessage("Error: " + error.message);
			} else {
				setMessage("OTP has been sent to your email!");
				setStep(2); // Move to the next step to enter OTP
			}
		} catch (error) {
			setMessage("Error: " + error.message);
		}
	};

	const handleVerifyOtp = async () => {
		try {
			const { error } = await supabase.auth.verifyOtp({
				email,
				token: otp,
				type: "magiclink", // Use 'magiclink' for OTP verification
				options: {
					shouldCreateUser: false,
				},
			});

			if (error) {
				setMessage("Error: " + error.message);
			} else {
				setMessage("OTP verified! Redirecting to your profile...");
				navigate("/profile"); // Redirect to profile page after successful OTP verification
			}
		} catch (error) {
			setMessage("Error: " + error.message);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
				<h2 className="text-2xl font-bold text-center">Forgot Password</h2>
				{step === 1 && (
					<div>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							onClick={handleSendOtp}
							className="w-full py-2 mb-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
						>
							Send OTP
						</button>
					</div>
				)}

				{step === 2 && (
					<div>
						<input
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							placeholder="Enter OTP"
							className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							onClick={handleVerifyOtp}
							className="w-full py-2 mb-4 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
						>
							Verify OTP
						</button>
					</div>
				)}

				{message && <p>{message}</p>}
			</div>
		</div>
	);
};

export default ForgotPassword;
