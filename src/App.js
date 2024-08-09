import React, { useState, useEffect } from "react";
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
import Homepage from "./components/Homepage";
import { supabase } from "./lib/supabaseClient"; // Ensure supabase client is imported
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [fetchTasksCallback, setFetchTasksCallback] = useState(() => () => {});
	const [session, setSession] = useState(null); // Track session state
	const [loading, setLoading] = useState(true);

	// Check if the app is running inside Electron
	const isElectron = !!window.require;

	useEffect(() => {
		const validateSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				// Validate if the user still exists in Supabase
				const { data: user, error } = await supabase.auth.getUser(
					session.access_token
				);

				if (error || !user) {
					// If the user doesn't exist, log out and clear session
					await supabase.auth.signOut();
					setSession(null);
				} else {
					setSession(session);
				}
			}
			setLoading(false);
		};

		validateSession();
	}, []);

	const handleOpenTaskModal = () => {
		setIsTaskModalOpen(true);
	};

	const handleCloseTaskModal = () => {
		setIsTaskModalOpen(false);
	};

	if (loading) {
		// Show a loading screen while checking session validity
		return <div>Loading...</div>;
	}

	return (
		<Router>
			<Navbar onOpenTaskModal={handleOpenTaskModal} />
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/auth" element={<Auth />} />
				<Route path="/verify-email" element={<EmailVerification />} />
				<Route element={<ProtectedRoute session={session} />}>
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
				<Route path="*" element={<Navigate to="/" />} />
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
