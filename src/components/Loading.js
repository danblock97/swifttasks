// src/components/Loading.js

import React from "react";
import "../index.css";

const Loading = () => {
	return (
		<div className="flex justify-center items-center min-h-screen bg-indigo-500">
			<h1 className="text-white text-4xl font-bold">
				Loading
				<span className="animate-dots">...</span>
			</h1>
		</div>
	);
};

export default Loading;
