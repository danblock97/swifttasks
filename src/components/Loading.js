import React from "react";
import "../index.css";
import logo from "../images/logo.jpg";

const Loading = () => {
	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-indigo-500">
			<img src={logo} alt="SwiftTasks Logo" className="w-64 h-64" />{" "}
			<h1 className="text-white text-3xl font-bold mb-2"> SwiftTasks</h1>
			<h2 className="text-white text-xl">
				Loading<span className="animate-dots">...</span>{" "}
			</h2>
		</div>
	);
};

export default Loading;
