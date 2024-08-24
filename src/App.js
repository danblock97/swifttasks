import React, { useState, useEffect } from "react";
import {
	BrowserRouter as WebRouter,
	HashRouter as ElectronRouter,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import TaskList from "./components/TaskList";
import Profile from "./components/Profile";
import Auth from "./components/Auth";
import EmailVerification from "./components/EmailVerification";
import ForgotPassword from "./components/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import TaskModal from "./components/TaskModal";
import Homepage from "./components/Homepage";
import OtpToken from "./components/OtpToken";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { supabase } from "./lib/supabaseClient";
import { ToastContainer } from "react-toastify";
import { Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import { DarkModeProvider } from "./context/DarkModeContext";

const App = () => {
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [fetchTasksCallback, setFetchTasksCallback] = useState(() => () => {});
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	const isElectron = !!window.require;

	useEffect(() => {
		const validateSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session) {
				const { data: user, error } = await supabase.auth.getUser(
					session.access_token
				);

				if (error || !user) {
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
		return <Loading />;
	}

	const Router = isElectron ? ElectronRouter : WebRouter;

	return (
		<DarkModeProvider>
			<Router>
				<div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-300">
					<Navbar onOpenTaskModal={handleOpenTaskModal} />
					<main className="flex-grow overflow-y-auto">
						<Routes>
							<Route path="/" element={<Homepage />} />
							<Route path="/auth" element={<Auth />} />
							<Route path="/verify-email" element={<EmailVerification />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route path="/otp-token" element={<OtpToken />} />
							<Route path="/terms-of-service" element={<TermsOfService />} />
							<Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
					</main>
					<TaskModal
						isOpen={isTaskModalOpen}
						onClose={handleCloseTaskModal}
						fetchTasks={fetchTasksCallback}
					/>
					<Footer />
					<ToastContainer
						position="bottom-right"
						autoClose={3000}
						hideProgressBar={false}
						newestOnTop
						closeOnClick
						rtl={false}
						pauseOnFocusLoss={false}
						draggable
						pauseOnHover
						theme="light"
						transition={Flip}
					/>
				</div>
			</Router>
		</DarkModeProvider>
	);
};

export default App;
