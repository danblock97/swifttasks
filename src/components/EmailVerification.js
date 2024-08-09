import React from "react";

const EmailVerification = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
				<h2 className="text-2xl font-bold text-center">Verify Your Email</h2>
				<p className="text-center text-gray-700">
					A verification email has been sent to your email address. Please check
					your inbox and follow the instructions to verify your email.
				</p>
			</div>
		</div>
	);
};

export default EmailVerification;
