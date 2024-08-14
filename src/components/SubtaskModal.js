import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

const SubtaskModal = ({
	isOpen,
	onClose,
	subtask,
	parentTaskId,
	fetchSubtasks,
}) => {
	const [newSubtask, setNewSubtask] = useState({
		title: "",
		description: "",
		due_date: "",
		priority: "low",
		status: "todo",
	});

	useEffect(() => {
		if (subtask) {
			setNewSubtask({
				title: subtask.title,
				description: subtask.description,
				due_date: subtask.due_date,
				priority: subtask.priority,
				status: subtask.status || "todo",
			});
		} else {
			setNewSubtask({
				title: "",
				description: "",
				due_date: "",
				priority: "low",
				status: "todo",
			});
		}
	}, [subtask]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewSubtask((prevTask) => ({ ...prevTask, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("User not authenticated");
				return;
			}

			const subtaskData = {
				title: newSubtask.title,
				description: newSubtask.description,
				due_date: newSubtask.due_date,
				priority: newSubtask.priority,
				status: newSubtask.status,
				parent_task_id: parentTaskId,
				user_id: user.id,
			};

			let error;
			if (subtask) {
				// Update existing subtask
				({ error } = await supabase
					.from("subtasks")
					.update(subtaskData)
					.eq("id", subtask.id));
			} else {
				// Create new subtask
				({ error } = await supabase.from("subtasks").insert([subtaskData]));
			}

			if (error) {
				console.error("Error saving subtask:", error);
				toast.error("Error saving subtask");
			} else {
				setNewSubtask({
					title: "",
					description: "",
					due_date: "",
					priority: "low",
					status: "todo",
				});
				onClose();
				fetchSubtasks(); // Fetch subtasks after creating/updating a subtask
				toast.success(
					`Subtask ${subtask ? "updated" : "created"} successfully`
				);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
			toast.error("Error fetching user");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
			<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
				<h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-300">
					{subtask ? "Edit Subtask" : "Create New Subtask"}
				</h2>
				<form onSubmit={handleSubmit} className="mb-4">
					<div className="mb-4">
						<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
							Title
						</label>
						<input
							type="text"
							name="title"
							value={newSubtask.title}
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
							value={newSubtask.description}
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
							value={newSubtask.due_date}
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
							value={newSubtask.priority}
							onChange={handleInputChange}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					{subtask && ( // Only show status when editing
						<div className="mb-4">
							<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
								Status
							</label>
							<select
								name="status"
								value={newSubtask.status}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
							>
								<option value="todo">To Do</option>
								<option value="in-progress">In Progress</option>
								<option value="done">Done</option>
							</select>
						</div>
					)}
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
							{subtask ? "Update" : "Create"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SubtaskModal;
