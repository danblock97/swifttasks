import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import TaskDetail from "./TaskDetail";
import NoTasks from "./NoTasks";
import TaskModal from "./TaskModal";
import Loading from "./Loading"; // Import the LoadingSpinner component
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom"; // Added to handle task highlighting

const TaskList = ({ onOpenTaskModal }) => {
	const [tasks, setTasks] = useState([]);
	const [selectedTask, setSelectedTask] = useState(null);
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [shownNotifications, setShownNotifications] = useState(new Set());
	const [notificationChecked, setNotificationChecked] = useState(false);
	const [isLoading, setIsLoading] = useState(true); // Add a loading state
	const [taskCategories, setTaskCategories] = useState([]); // State to hold unique categories
	const [selectedCategory, setSelectedCategory] = useState(""); // State for selected category filter
	const [selectedStatus, setSelectedStatus] = useState(""); // State for selected status filter
	const [selectedDueDate, setSelectedDueDate] = useState(""); // State for selected due date filter
	const [filterType, setFilterType] = useState(""); // State for filter type selection
	const location = useLocation(); // Added to handle task highlighting

	const fetchTasks = useCallback(
		async (selectLastTask = false) => {
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
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching tasks:", error);
			} else {
				setTasks(data);

				// Collect unique categories from tasks
				const categories = [
					...new Set(data.flatMap((task) => task.categories || [])),
				];
				setTaskCategories(categories);

				if (data.length > 0) {
					const savedTaskId = localStorage.getItem("selectedTaskId");
					const taskIdToHighlight = location.state?.highlightTaskId;
					let selected =
						taskIdToHighlight &&
						data.find((task) => task.id === taskIdToHighlight);

					if (!selected && savedTaskId) {
						selected = data.find((task) => task.id === parseInt(savedTaskId));
					}
					if (!selected || selectLastTask) {
						selected = data[0];
						localStorage.setItem("selectedTaskId", selected.id);
					}
					setSelectedTask(selected);
				} else {
					setSelectedTask(null);
				}
			}
			setIsLoading(false); // Set loading to false once data is fetched
		},
		[location.state?.highlightTaskId]
	);

	const checkForDueOrOverdueTasks = useCallback(() => {
		if (notificationChecked) return;

		const today = new Date();
		today.setHours(0, 0, 0, 0); // Ensure the time component is removed

		let dueTodayTasks = [];
		let overdueTasks = [];

		tasks.forEach((task) => {
			if (shownNotifications.has(task.id)) return;

			const taskDueDate = new Date(task.due_date);
			taskDueDate.setHours(0, 0, 0, 0); // Remove the time component for accurate comparison

			const isOverdue = taskDueDate < today && task.status !== "done";
			const isDueToday =
				taskDueDate.getTime() === today.getTime() && task.status !== "done";

			if (isDueToday) {
				dueTodayTasks.push(task.title);
				setShownNotifications((prev) => new Set(prev).add(task.id));
			} else if (isOverdue) {
				overdueTasks.push(task.title);
				setShownNotifications((prev) => new Set(prev).add(task.id));
			}
		});

		if (dueTodayTasks.length > 0) {
			toast.info(`You have ${dueTodayTasks.length} tasks due today`);
		}

		if (overdueTasks.length > 0) {
			toast.warning(`You have ${overdueTasks.length} overdue tasks`);
		}

		setNotificationChecked(true);
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
		fetchTasks(true); // Refresh tasks and select the newly created task
	};

	const handleFilterTypeChange = (e) => {
		setFilterType(e.target.value);
		setSelectedCategory("");
		setSelectedStatus("");
		setSelectedDueDate("");
	};

	const handleCategoryChange = (e) => {
		setSelectedCategory(e.target.value);
	};

	const handleStatusChange = (e) => {
		setSelectedStatus(e.target.value);
	};

	const handleDueDateChange = (e) => {
		setSelectedDueDate(e.target.value);
	};

	const filteredTasks = tasks.filter((task) => {
		if (filterType === "category") {
			return (
				selectedCategory === "" ||
				(task.categories && task.categories.includes(selectedCategory))
			);
		} else if (filterType === "status") {
			return selectedStatus === "" || task.status === selectedStatus;
		} else if (filterType === "due_date") {
			return selectedDueDate === "" || task.due_date === selectedDueDate;
		} else {
			return true; // Show all tasks if no filter is selected
		}
	});

	if (isLoading) {
		return <Loading />; // Show loading spinner while fetching data
	}

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
		<div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300">
			<div className="w-full md:w-1/3 p-4">
				<div className="flex flex-col gap-4 mb-4">
					<h2 className="text-xl font-bold mb-2 md:mb-0">Your Tasks</h2>

					{/* Filter Type Selection */}
					<select
						value={filterType}
						onChange={handleFilterTypeChange}
						className="w-full md:w-40 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">No Filter</option>
						<option value="category">Filter by Category</option>
						<option value="status">Filter by Status</option>
						<option value="due_date">Filter by Due Date</option>
					</select>

					{/* Conditionally Render Filter Input */}
					{filterType === "category" && (
						<select
							value={selectedCategory}
							onChange={handleCategoryChange}
							className="w-full md:w-40 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Categories</option>
							{taskCategories.map((category, index) => (
								<option key={index} value={category}>
									{category}
								</option>
							))}
						</select>
					)}

					{filterType === "status" && (
						<select
							value={selectedStatus}
							onChange={handleStatusChange}
							className="w-full md:w-40 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Statuses</option>
							<option value="to_do">To Do</option>
							<option value="in_progress">In Progress</option>
							<option value="done">Done</option>
						</select>
					)}

					{filterType === "due_date" && (
						<input
							type="date"
							value={selectedDueDate}
							onChange={handleDueDateChange}
							className="w-full md:w-40 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					)}
				</div>

				<ul>
					{filteredTasks.map((task) => (
						<li key={task.id} onClick={() => handleTaskClick(task)}>
							<div
								className={`task-item hover:bg-gray-100 dark:hover:bg-gray-800 p-4 mb-2 rounded-lg shadow-md flex ${
									selectedTask && selectedTask.id === task.id
										? "bg-grey-100"
										: ""
								}`}
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
