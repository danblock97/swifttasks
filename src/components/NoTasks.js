import React from "react";
import noTasksImage from "../images/no-tasks.jpg";

const NoTasks = ({ onCreateFirstTask }) => {
	return (
		<div className="flex h-screen dark:bg-gray-700 items-center justify-center min-h-88">
			<div className="w-full max-w-md p-8 space-y-8 text-center">
				<img
					src={noTasksImage}
					alt="No tasks"
					className="w-full h-full object-cover rounded-lg mb-4"
				/>
				<h2 className="text-2xl dark:text-gray-300 font-bold mb-4 text-indigo-500">
					Welcome to SwiftTasks
				</h2>
				<p className="text-gray-700 dark:text-gray-300 mb-4">
					It looks like you don't have any tasks yet.
				</p>
				<button
					onClick={onCreateFirstTask}
					className="w-full py-2 font-semibold dark:text-gray-300 text-white bg-indigo-500 rounded hover:bg-indigo-600"
				>
					Create Your First Task
				</button>
			</div>
		</div>
	);
};

export default NoTasks;
