import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import TaskList from "./components/TaskList";
import Profile from "./components/Profile";
import Auth from "./components/Auth";
import EmailVerification from "./components/EmailVerification";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import TaskModal from "./components/TaskModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [fetchTasksCallback, setFetchTasksCallback] = useState(() => () => {});

	const handleOpenTaskModal = () => {
		setIsTaskModalOpen(true);
	};

	const handleCloseTaskModal = () => {
		setIsTaskModalOpen(false);
	};

	return (
		<Router>
			<Navbar onOpenTaskModal={handleOpenTaskModal} />
			<Routes>
				<Route path="/auth" element={<Auth />} />
				<Route path="/verify-email" element={<EmailVerification />} />
				<Route element={<ProtectedRoute />}>
					<Route
						path="/tasks"
						element={
							<TaskList
								onOpenTaskModal={handleOpenTaskModal}
								setFetchTasksCallback={setFetchTasksCallback}
							/>
						}
					/>
					<Route path="/profile" element={<Profile />} />
				</Route>
				<Route path="*" element={<Navigate to="/auth" />} />
			</Routes>
			<TaskModal
				isOpen={isTaskModalOpen}
				onClose={handleCloseTaskModal}
				fetchTasks={fetchTasksCallback}
			/>
			<ToastContainer />
		</Router>
	);
};

export default App;
