import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import TaskDetail from "./TaskDetail";
import NoTasks from "./NoTasks";
import TaskModal from "./TaskModal";
import { toast } from "react-toastify";

const TaskList = ({ onOpenTaskModal }) => {
	const [tasks, setTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(null);
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [shownNotifications, setShownNotifications] = useState(new Set()); // Use Set to track shown notifications
	const [notificationChecked, setNotificationChecked] = useState(false); // Track if notifications have been checked

	const fetchTasks = useCallback(async (selectLastTask = false) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			console.error("User not authenticated");
			return;
		}

		const { data, error } = await supabase
			.from("tasks")
			.select("*")
			.eq("user_id", user.id) // Filter tasks by user_id
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching tasks:", error);
		} else {
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
				setSelectedTask(selected);
			} else {
				setSelectedTask(null);
			}
		}
	}, []);

	const checkForDueOrOverdueTasks = useCallback(() => {
		if (notificationChecked) return; // Ensure this runs only once

		const today = new Date().toDateString();

		tasks.forEach((task) => {
			if (shownNotifications.has(task.id)) return; // Skip if notification already shown

			const taskDueDate = new Date(task.due_date).toDateString();
			const isOverdue = taskDueDate < today && task.status !== "done";
			const isDueToday = taskDueDate === today && task.status !== "done";

			if (isDueToday) {
				toast.info(`You have tasks due today: "${task.title}"`);
				setShownNotifications((prev) => new Set(prev).add(task.id)); // Mark as shown
			} else if (isOverdue) {
				toast.warning(`You have overdue tasks: "${task.title}"`);
				setShownNotifications((prev) => new Set(prev).add(task.id)); // Mark as shown
			}
		});

		setNotificationChecked(true); // Mark as checked to avoid rerunning
	}, [tasks, shownNotifications, notificationChecked]);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	useEffect(() => {
		if (tasks.length > 0) {
			checkForDueOrOverdueTasks();
		}
	}, [tasks, checkForDueOrOverdueTasks]);

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
		<div className="flex flex-col md:flex-row h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300">
			<div className="w-full md:w-1/3 p-4">
				<h2 className="text-xl md:text-2xl font-bold mb-4">Your Tasks</h2>
				<ul>
					{tasks.map((task) => (
						<li key={task.id} onClick={() => handleTaskClick(task)}>
							<div
								className={`task-item hover:bg-gray-100 dark:hover:bg-gray-800 p-4 mb-2 rounded-lg shadow-md flex`}
							>
								<div
									className={`w-2 h-full mr-4 ${
										task.priority === "low"
											? "bg-green-500"
											: task.priority === "medium"
											? "bg-orange-500"
											: "bg-red-500"
									}`}
								></div>
								<div
									className={`flex-1 ${
										selectedTask && selectedTask.id === task.id
											? "bg-grey-100"
											: ""
									}`}
								>
									<p className="font-semibold">{task.title}</p>
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>
			<div className="w-full md:w-2/3 p-4">
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
