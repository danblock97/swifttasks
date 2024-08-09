import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TaskModal = ({ isOpen, onClose, fetchTasks, selectedTask, subtasks }) => {
	// Existing state and functions...

	const deleteTask = async () => {
		if (subtasks.length > 0) {
			if (
				!window.confirm(
					"This task has subtasks. Deleting this task will also remove all subtasks. Are you sure you want to delete this task?"
				)
			) {
				return;
			}
		}
		try {
			const { error: subtaskError } = await supabase
				.from("subtasks")
				.delete()
				.eq("parent_task_id", selectedTask.id);

			const { error: taskError } = await supabase
				.from("tasks")
				.delete()
				.eq("id", selectedTask.id);

			if (taskError || subtaskError) {
				console.error(
					"Error deleting task or subtasks:",
					taskError || subtaskError
				);
				toast.error("Error deleting task");
			} else {
				onClose();
				fetchTasks();
				toast.success("Task and subtasks deleted successfully");
			}
		} catch (error) {
			console.error("Error deleting task:", error);
			toast.error("Error deleting task");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
			<div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
				<h2 className="text-2xl font-bold mb-4">Task Actions</h2>
				{/* Existing task creation/update form... */}
				<div className="flex justify-between mt-4">
					<button
						type="button"
						onClick={deleteTask}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					>
						Delete Task
					</button>
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default TaskModal;
