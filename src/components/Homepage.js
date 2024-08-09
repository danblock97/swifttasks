import React from "react";
import { TypeAnimation } from "react-type-animation";
import logo from "../images/logo.jpg";

const Homepage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen text-indigo-500">
			<div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row items-center justify-between">
				<div className="text-center md:text-left md:pr-10">
					<h1 className="text-5xl font-extrabold mb-4">
						Welcome to <span className="text-indigo-500">SwiftTasks</span>
					</h1>
					<TypeAnimation
						sequence={[
							"Organize Your Life",
							2000,
							"Boost Your Productivity",
							2000,
							"Get Started Today!",
							2000,
						]}
						wrapper="h2"
						cursor={true}
						repeat={Infinity}
						className="text-4xl font-bold"
					/>
					<p className="text-gray-400 mt-6 mb-8 max-w-lg">
						SwiftTasks helps you manage your tasks efficiently and effectively.
						Whether you're managing personal to-dos or professional projects,
						SwiftTasks has you covered.
					</p>
					<div className="flex justify-center md:justify-start space-x-4">
						<a
							href="/auth"
							className="inline-block px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full hover:bg-indigo-600 transition"
						>
							Get Started
						</a>
						<a
							href="#"
							className="inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition"
						>
							Download for Windows
						</a>
					</div>
				</div>
				<div className="mt-10 md:mt-0">
					<img
						src={logo}
						alt="SwiftTasks Logo"
						className="w-64 h-64 object-contain mx-auto"
					/>
				</div>
			</div>
		</div>
	);
};

export default Homepage;
