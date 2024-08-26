import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
	const version = "1.6.1";

	return (
		<footer className="bg-indigo-500 text-white py-6">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row justify-between items-center">
					<div className="text-center md:text-left">
						<p className="text-sm">
							&copy; {new Date().getFullYear()} SwiftTasks. All rights reserved.{" "}
							<span className="block md:inline">Version {version}</span>
						</p>
					</div>
					<div className="flex space-x-4 mt-4 md:mt-0">
						<Link
							to="/terms-of-service"
							className="text-white hover:text-gray-300 text-sm"
						>
							Terms of Service
						</Link>
						<Link
							to="/privacy-policy"
							className="text-white hover:text-gray-300 text-sm"
						>
							Privacy Policy
						</Link>
					</div>
				</div>
				<div className="mt-4 text-center text-xs">
					<p>
						Built with ♥ by SwiftTasks Team. Your productivity, our priority.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
