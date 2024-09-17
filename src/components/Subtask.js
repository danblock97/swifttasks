import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

const Subtask = ({ subtask, fetchSubtasks }) => {
	const [title, setTitle] = useState(subtask.title);
	const [status, setStatus] = useState(subtask.status);
	const [isEditing, setIsEditing] = useState(false);

	const updateSubtask = async () => {
		try {
			const { data: oldSubtaskData, error: fetchError } = await supabase
				.from("subtasks")
				.select("*")
				.eq("id", subtask.id)
				.single();

			if (fetchError) {
				console.error("Error fetching old subtask data:", fetchError);
				toast.error("Error fetching old subtask data");
				return;
			}

			const oldSubtask = oldSubtaskData;

			// Update the subtask
			const { error } = await supabase
				.from("subtasks")
				.update({ title, status })
				.eq("id", subtask.id);

			if (error) {
				console.error("Error updating subtask:", error);
				toast.error("Error updating subtask");
			} else {
				// Record changes in activity_logs
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					console.error("User not authenticated");
					toast.error("User not authenticated");
					return;
				}

				const changes = [];

				if (oldSubtask.title !== title) {
					changes.push({
						field_name: "title",
						old_value: oldSubtask.title,
						new_value: title,
					});
				}

				if (oldSubtask.status !== status) {
					changes.push({
						field_name: "status",
						old_value: oldSubtask.status,
						new_value: status,
					});
				}

				// Insert activity logs
				for (const change of changes) {
					const { error: logError } = await supabase
						.from("activity_logs")
						.insert([
							{
								entity_type: "subtask",
								entity_id: subtask.id,
								user_id: user.id,
								user_email: user.email,
								action: "updated",
								field_name: change.field_name,
								old_value: change.old_value,
								new_value: change.new_value,
							},
						]);

					if (logError) {
						console.error("Error inserting activity log:", logError);
					}
				}

				fetchSubtasks();
				toast.success("Subtask updated successfully");
				setIsEditing(false);
			}
		} catch (error) {
			console.error("Error updating subtask:", error);
			toast.error("Error updating subtask");
		}
	};

	const deleteSubtask = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			console.error("User not authenticated");
			toast.error("User not authenticated");
			return;
		}

		const { error } = await supabase
			.from("subtasks")
			.delete()
			.eq("id", subtask.id);

		if (error) {
			console.error("Error deleting subtask:", error);
			toast.error("Error deleting subtask");
		} else {
			// Record activity log
			const { error: logError } = await supabase.from("activity_logs").insert([
				{
					entity_type: "subtask",
					entity_id: subtask.id,
					user_id: user.id,
					user_email: user.email,
					action: "deleted",
				},
			]);

			if (logError) {
				console.error("Error inserting activity log:", logError);
			}

			fetchSubtasks();
			toast.success("Subtask deleted successfully");
		}
	};

	return (
		<div className="bg-white p-2 rounded-lg shadow-md flex">
			<div
				className={`w-2 h-auto mr-4 ${
					subtask.priority === "low"
						? "bg-green-500"
						: subtask.priority === "medium"
						? "bg-orange-500"
						: "bg-red-500"
				}`}
			></div>
			<div className="flex-1">
				{isEditing ? (
					<div>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-2 py-1 mb-2 border rounded"
						/>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-2 py-1 mb-2 border rounded"
						>
							<option value="to_do">To Do</option>
							<option value="in_progress">In Progress</option>
							<option value="done">Done</option>
						</select>
						<div className="flex justify-end space-x-2">
							<button
								onClick={updateSubtask}
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
						<h5 className="text-md font-semibold mb-1">{subtask.title}</h5>
						<p className="text-gray-600 mb-2">Status: {subtask.status}</p>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setIsEditing(true)}
								className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
							>
								Edit
							</button>
							<button
								onClick={deleteSubtask}
								className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
							>
								Delete
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Subtask;
