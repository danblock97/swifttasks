import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TaskModal = ({ isOpen, onClose, fetchTasks }) => {
	const [newTask, setNewTask] = useState({
		title: "",
		description: "",
		due_date: "",
		priority: "low",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
	};

	const createTask = async (e) => {
		e.preventDefault();
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("User not authenticated");
				return;
			}

			const taskData = {
				title: newTask.title,
				description: newTask.description,
				due_date: newTask.due_date,
				priority: newTask.priority,
				user_id: user.id,
			};

			const { error } = await supabase
				.from("tasks")
				.insert([taskData])
				.select();

			if (error) {
				console.error("Error creating task:", error);
				toast.error("Error creating task");
			} else {
				setNewTask({
					title: "",
					description: "",
					due_date: "",
					priority: "low",
				});
				onClose();
				await fetchTasks(true); // Ensure tasks are fetched and select the last created task
				toast.success("Task created successfully");
			}
		} catch (error) {
			console.error("Error fetching user:", error);
			toast.error("Error fetching user");
		} finally {
			// As a last resort, force a page refresh to update the task list
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
			<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
				<h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-300">
					Create New Task
				</h2>
				<form onSubmit={createTask} className="mb-4">
					<div className="mb-4">
						<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
							Title
						</label>
						<input
							type="text"
							name="title"
							value={newTask.title}
							onChange={handleInputChange}
							placeholder="Title"
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							required
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
							Description
						</label>
						<textarea
							name="description"
							value={newTask.description}
							onChange={handleInputChange}
							placeholder="Description"
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
							Due Date
						</label>
						<input
							type="date"
							name="due_date"
							value={newTask.due_date}
							onChange={handleInputChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
							Priority
						</label>
						<select
							name="priority"
							value={newTask.priority}
							onChange={handleInputChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					<div className="flex justify-end space-x-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-800"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default TaskModal;
