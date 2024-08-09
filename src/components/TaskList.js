import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import TaskDetail from "./TaskDetail";
import NoTasks from "./NoTasks";
import TaskModal from "./TaskModal";

const TaskList = ({ onOpenTaskModal }) => {
	const [tasks, setTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(null);
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

	const fetchTasks = useCallback(async (selectLastTask = false) => {
		console.log("Fetching tasks...");
		const { data, error } = await supabase
			.from("tasks")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching tasks:", error);
		} else {
			console.log("Fetched tasks:", data);
			setTasks(data);

			if (data.length > 0) {
				const savedTaskId = localStorage.getItem("selectedTaskId");
				let selected = savedTaskId
					? data.find((task) => task.id === parseInt(savedTaskId))
					: null;
				if (!selected || selectLastTask) {
					selected = data[0];
					localStorage.setItem("selectedTaskId", selected.id);
				}
				console.log("Setting selected task:", selected);
				setSelectedTask(selected);
			} else {
				setSelectedTask(null);
			}
		}
	}, []);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	const handleTaskClick = (task) => {
		setSelectedTask(task);
		localStorage.setItem("selectedTaskId", task.id);
	};

	const handleOpenTaskModal = () => {
		setIsTaskModalOpen(true);
	};

	const handleCloseTaskModal = () => {
		setIsTaskModalOpen(false);
		fetchTasks(true); // Pass true to select the last created task
	};

	if (tasks.length === 0) {
		return (
			<>
				<NoTasks onCreateFirstTask={handleOpenTaskModal} />
				<TaskModal
					isOpen={isTaskModalOpen}
					onClose={handleCloseTaskModal}
					fetchTasks={fetchTasks}
				/>
			</>
		);
	}

	return (
		<div className="flex">
			<div className="w-1/3 p-4">
				<h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
				<ul>
					{tasks.map((task) => (
						<li key={task.id} onClick={() => handleTaskClick(task)}>
							<div
								className={`task-item hover:bg-gray-100 p-4 mb-2 rounded-lg shadow-md ${
									selectedTask && selectedTask.id === task.id
										? "bg-blue-100"
										: ""
								}`}
							>
								<p className="font-semibold">{task.title}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
			<div className="w-2/3 p-4">
				{selectedTask && (
					<TaskDetail task={selectedTask} fetchTasks={fetchTasks} />
				)}
			</div>
			<TaskModal
				isOpen={isTaskModalOpen}
				onClose={handleCloseTaskModal}
				fetchTasks={fetchTasks}
			/>
		</div>
	);
};

export default TaskList;
