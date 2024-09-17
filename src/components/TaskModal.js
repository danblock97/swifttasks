import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import CategoryInput from "./CategoryInput";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";

let remote;
const isElectron =
	typeof window !== "undefined" &&
	window.process &&
	window.process.type === "renderer";

if (isElectron) {
	remote = window.require("@electron/remote");
}

const TaskModal = ({ isOpen, onClose, fetchTasks, task }) => {
	const [taskData, setTaskData] = useState({
		title: "",
		description: "",
		due_date: "",
		priority: "low",
		status: "To Do",
		categories: [],
		recurrence_type: "none",
		recurrence_custom_interval: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [modalHeight, setModalHeight] = useState("100%");

	useEffect(() => {
		if (task) {
			setTaskData({
				title: task.title,
				description: task.description,
				due_date: task.due_date,
				priority: task.priority,
				status: task.status ? formatStatus(task.status) : "To Do",
				categories: task.categories || [],
				recurrence_type: task.recurrence_type || "none",
				recurrence_custom_interval: task.recurrence_custom_interval || null,
			});
		} else {
			setTaskData({
				title: "",
				description: "",
				due_date: "",
				priority: "low",
				status: "To Do",
				categories: [],
				recurrence_type: "none",
				recurrence_custom_interval: null,
			});
		}
	}, [task]);

	const formatStatus = (status) => {
		switch (status) {
			case "to_do":
				return "To Do";
			case "in_progress":
				return "In Progress";
			case "done":
				return "Done";
			default:
				return status;
		}
	};

	const reverseFormatStatus = (status) => {
		switch (status) {
			case "To Do":
				return "to_do";
			case "In Progress":
				return "in_progress";
			case "Done":
				return "done";
			default:
				return status;
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setTaskData((prevTask) => ({ ...prevTask, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		let error;
		let newDueDate = taskData.due_date;
		let newStatus = taskData.status;

		// Handle recurrence logic
		if (
			reverseFormatStatus(taskData.status) === "done" &&
			taskData.recurrence_type !== "none"
		) {
			const currentDate = new Date(taskData.due_date);

			if (taskData.recurrence_type === "daily") {
				currentDate.setDate(currentDate.getDate() + 1);
			} else if (taskData.recurrence_type === "weekly") {
				currentDate.setDate(currentDate.getDate() + 7);
			} else if (taskData.recurrence_type === "monthly") {
				currentDate.setMonth(currentDate.getMonth() + 1);
			} else if (
				taskData.recurrence_type === "custom" &&
				taskData.recurrence_custom_interval
			) {
				currentDate.setDate(
					currentDate.getDate() + taskData.recurrence_custom_interval
				);
			}

			newDueDate = currentDate.toISOString().split("T")[0];
			newStatus = "To Do";
		}

		// Update or insert the task
		if (task) {
			({ error } = await supabase
				.from("tasks")
				.update({
					title: taskData.title,
					description: taskData.description,
					due_date: newDueDate,
					priority: taskData.priority,
					status: reverseFormatStatus(newStatus),
					categories: taskData.categories,
					recurrence_type: taskData.recurrence_type,
					recurrence_custom_interval: taskData.recurrence_custom_interval,
				})
				.eq("id", task.id));
		} else {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("User not authenticated");
				return;
			}

			({ error } = await supabase.from("tasks").insert([
				{
					...taskData,
					due_date: newDueDate,
					status: reverseFormatStatus(newStatus),
					user_id: user.id,
				},
			]));
		}

		if (error) {
			console.error("Error saving task:", error);
			toast.error("Error saving task");
		} else {
			toast.success(`Task ${task ? "updated" : "created"} successfully`);
			onClose();
			setIsLoading(true);
			setTimeout(() => {
				window.location.reload();
			}, 500);
		}
	};

	// Prevent background scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			const originalStyle = window.getComputedStyle(document.body).overflow;
			document.body.style.overflow = "hidden";

			if (isElectron && remote) {
				const currentWindow = remote.getCurrentWindow();
				const { height } = currentWindow.getBounds();
				setModalHeight(`${height}px`);
				const handleResize = () => {
					const { height } = currentWindow.getBounds();
					setModalHeight(`${height}px`);
				};
				currentWindow.on("resize", handleResize);

				return () => {
					currentWindow.removeListener("resize", handleResize);
					document.body.style.overflow = originalStyle;
				};
			}

			return () => {
				document.body.style.overflow = originalStyle;
			};
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<>
			{isLoading && <Loading />}
			<div
				className={`fixed left-0 right-0 top-[56px] bg-gray-800 bg-opacity-75 overflow-y-auto`}
				style={{
					height: isElectron ? modalHeight : "calc(100vh - 56px)",
				}}
			>
				<div className="flex items-center justify-center min-h-full">
					<div className="modal-content bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md md:max-w-lg lg:max-w-xl mx-4 my-8 overflow-y-auto max-h-[calc(100vh-3.5rem-4rem)]">
						<h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-300">
							{task ? "Edit Task" : "Create New Task"}
						</h2>
						<form onSubmit={handleSubmit} className="mb-4">
							{/* Title Field */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Title
								</label>
								<input
									type="text"
									name="title"
									value={taskData.title}
									onChange={handleInputChange}
									placeholder="Title"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
									required
								/>
							</div>
							{/* Description Field */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Description
								</label>
								<textarea
									name="description"
									value={taskData.description}
									onChange={handleInputChange}
									placeholder="Description"
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								/>
							</div>
							{/* Due Date Field */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Due Date
								</label>
								<input
									type="date"
									name="due_date"
									value={taskData.due_date}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								/>
							</div>
							{/* Priority Field */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Priority
								</label>
								<select
									name="priority"
									value={taskData.priority}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
								</select>
							</div>
							{/* Status Field */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Status
								</label>
								<select
									name="status"
									value={taskData.status}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								>
									<option value="To Do">To Do</option>
									<option value="In Progress">In Progress</option>
									<option value="Done">Done</option>
								</select>
							</div>
							{/* Categories Field */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Categories
								</label>
								<CategoryInput
									categories={taskData.categories}
									setCategories={(categories) =>
										setTaskData((prev) => ({ ...prev, categories }))
									}
								/>
							</div>
							{/* Recurrence Options */}
							<div className="mb-4">
								<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
									Recurrence
								</label>
								<select
									name="recurrence_type"
									value={taskData.recurrence_type}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
								>
									<option value="none">None</option>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
									<option value="custom">Custom</option>
								</select>
							</div>
							{taskData.recurrence_type === "custom" && (
								<div className="mb-4">
									<label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">
										Custom Interval (Days)
									</label>
									<input
										type="number"
										name="recurrence_custom_interval"
										value={taskData.recurrence_custom_interval || ""}
										onChange={handleInputChange}
										placeholder="Enter number of days"
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300"
									/>
								</div>
							)}
							{/* Buttons */}
							<div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
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
									{task ? "Update" : "Create"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default TaskModal;
