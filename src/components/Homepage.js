import React from "react";

const Homepage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-2xl p-8 bg-white shadow-lg rounded-lg text-center">
				<h1 className="text-4xl font-bold text-indigo-500 mb-6">
					Welcome to SwiftTasks
				</h1>
				<p className="text-gray-700 mb-8">
					SwiftTasks helps you manage your tasks efficiently and effectively.
					Sign up or log in to start organizing your tasks today!
				</p>
				<a
					href="/auth"
					className="inline-block px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-600 transition"
				>
					Get Started
				</a>
			</div>
		</div>
	);
};

export default Homepage;
