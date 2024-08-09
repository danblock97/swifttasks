import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SubtaskList from "./SubtaskList";
import { toast } from "react-toastify";

const Task = ({ task, fetchTasks }) => {
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description);
	const [dueDate, setDueDate] = useState(task.due_date);
	const [priority, setPriority] = useState(task.priority);
	const [status, setStatus] = useState(task.status);
	const [isEditing, setIsEditing] = useState(false);

	const updateTask = async () => {
		const { error } = await supabase
			.from("tasks")
			.update({ title, description, due_date: dueDate, priority, status })
			.eq("id", task.id);

		if (error) {
			console.error("Error updating task:", error);
			toast.error("Error updating task");
		} else {
			fetchTasks();
			toast.success("Task updated successfully");
			setIsEditing(false);
		}
	};

	const deleteTask = async () => {
		const { error } = await supabase.from("tasks").delete().eq("id", task.id);

		if (error) {
			console.error("Error deleting task:", error);
			toast.error("Error deleting task");
		} else {
			fetchTasks();
			toast.success("Task deleted successfully");
		}
	};

	return (
		<div className="bg-white p-4 rounded-lg shadow-md">
			{isEditing ? (
				<div>
					<div className="mb-4">
						<label className="block text-gray-700 font-bold mb-2">Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-bold mb-2">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-bold mb-2">
							Due Date
						</label>
						<input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-bold mb-2">
							Priority
						</label>
						<select
							value={priority}
							onChange={(e) => setPriority(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-bold mb-2">Status</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="todo">To Do</option>
							<option value="in-progress">In Progress</option>
							<option value="done">Done</option>
						</select>
					</div>
					<div className="flex justify-end space-x-2">
						<button
							onClick={updateTask}
							className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Update
						</button>
						<button
							onClick={() => setIsEditing(false)}
							className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<div>
					<h3 className="text-xl font-bold mb-2">{task.title}</h3>
					<p className="text-gray-700 mb-2">{task.description}</p>
					<p className="text-gray-600 mb-2">Due Date: {task.due_date}</p>
					<p className="text-gray-600 mb-2">Priority: {task.priority}</p>
					<p className="text-gray-600 mb-2">Status: {task.status}</p>
					<div className="flex justify-end space-x-2">
						<button
							onClick={() => setIsEditing(true)}
							className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
						>
							Edit
						</button>
						<button
							onClick={deleteTask}
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
						>
							Delete
						</button>
					</div>
					<SubtaskList taskId={task.id} />
				</div>
			)}
		</div>
	);
};

export default Task;
