import React, { useEffect, useState } from "react";
import Switch from "react-switch";
import { useDarkMode } from "../context/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
	MdMinimize,
	MdClose,
	MdCropSquare,
	MdMenu,
	MdSearch,
} from "react-icons/md";

let ipcRenderer;
let remote;
const isElectron =
	typeof window !== "undefined" &&
	window.process &&
	window.process.type === "renderer";

if (isElectron) {
	ipcRenderer = window.require("electron").ipcRenderer;
	remote = window.require("@electron/remote");
}

const Navbar = ({ onOpenTaskModal }) => {
	const [session, setSession] = useState(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const navigate = useNavigate();
	const { isDarkMode, toggleDarkMode } = useDarkMode();

	useEffect(() => {
		if (ipcRenderer) {
			ipcRenderer.on("update_available", () => {});

			ipcRenderer.on("update_downloaded", () => {
				ipcRenderer.removeAllListeners("update_available");
				ipcRenderer.removeAllListeners("update_downloaded");
			});
		}

		return () => {
			if (ipcRenderer) {
				ipcRenderer.removeAllListeners("update_available");
				ipcRenderer.removeAllListeners("update_downloaded");
			}
		};
	}, []);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session && session.user.last_sign_in_at !== null) {
				setSession(session);
			} else {
				setSession(null);
			}
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session && session.user.last_sign_in_at !== null) {
				setSession(session);
			} else {
				setSession(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleSearch = async (e) => {
		const term = e.target.value;
		setSearchTerm(term);

		if (term.trim() !== "") {
			const { data, error } = await supabase
				.from("tasks")
				.select("id, title")
				.ilike("title", `%${term}%`);

			if (error) {
				console.error("Error searching tasks:", error);
			} else {
				setSearchResults(data);
			}
		} else {
			setSearchResults([]);
		}
	};

	const handleSearchClick = (taskId) => {
		navigate(`/tasks`, { state: { highlightTaskId: taskId } });
		setSearchResults([]);
		setSearchTerm("");
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setSession(null);
		localStorage.clear();
		navigate("/auth");
	};

	const handleLogin = () => {
		navigate("/auth");
	};

	const handleMinimize = () => {
		if (remote) remote.getCurrentWindow().minimize();
	};

	const handleMaximizeToggle = () => {
		if (remote) {
			const win = remote.getCurrentWindow();
			win.isMaximized() ? win.unmaximize() : win.maximize();
		}
	};

	const handleClose = () => {
		if (remote) remote.getCurrentWindow().close();
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<div className="flex h-full">
			{/* Main Content Area */}
			<div className={"flex-1"}>
				{/* Small Electron Header Bar */}
				{isElectron && (
					<div
						className="bg-indigo-600 h-8 flex justify-between items-center px-4 text-gray-300"
						style={{ WebkitAppRegion: "drag" }}
					>
						<div
							className="text-sm absolute left-0 pl-2"
							style={{ WebkitAppRegion: "no-drag" }}
						>
							SwiftTasks
						</div>
						<div className="flex space-x-2 ml-auto">
							<button
								onClick={handleMinimize}
								className="hover:bg-gray-700 p-1 rounded"
								style={{ WebkitAppRegion: "no-drag" }}
							>
								<MdMinimize size={16} />
							</button>
							<button
								onClick={handleMaximizeToggle}
								className="hover:bg-gray-700 p-1 rounded"
								style={{ WebkitAppRegion: "no-drag" }}
							>
								<MdCropSquare size={16} />
							</button>
							<button
								onClick={handleClose}
								className="hover:bg-red-600 p-1 rounded"
								style={{ WebkitAppRegion: "no-drag" }}
							>
								<MdClose size={16} />
							</button>
						</div>
					</div>
				)}

				{/* Main Navbar */}
				<nav
					className={`shadow-lg flex h-14 justify-between items-center sticky top-0 z-40 ${
						isElectron ? "bg-indigo-500" : "bg-indigo-500"
					} `}
					style={{ WebkitAppRegion: isElectron ? "drag" : "no-drag" }}
				>
					{/* Centered Navigation Options */}
					<div
						className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 space-x-4"
						style={{ WebkitAppRegion: "no-drag" }}
					>
						{session ? (
							<div className="flex space-x-4">
								<button
									onClick={() => {
										navigate("/profile");
										setIsMobileMenuOpen(false);
									}}
									className="text-white cursor-pointer hover:text-gray-200"
								>
									Profile
								</button>
								<button
									onClick={() => {
										navigate("/tasks");
										setIsMobileMenuOpen(false);
									}}
									className="text-white cursor-pointer hover:text-gray-200"
								>
									View Tasks
								</button>
								<button
									onClick={() => {
										onOpenTaskModal();
										setIsMobileMenuOpen(false);
									}}
									className="text-white cursor-pointer hover:text-gray-200"
								>
									Create Task
								</button>
								<button
									onClick={() => {
										handleLogout();
										setIsMobileMenuOpen(false);
									}}
									className="text-white cursor-pointer hover:text-gray-200"
								>
									Logout
								</button>
							</div>
						) : (
							<button
								onClick={() => {
									handleLogin();
									setIsMobileMenuOpen(false);
								}}
								className="text-white cursor-pointer hover:text-gray-200"
							>
								Login
							</button>
						)}
					</div>

					{/* Search Bar and Dark Mode Toggle */}
					<div
						className="flex items-center space-x-4 ml-auto mr-3"
						style={{ WebkitAppRegion: "no-drag" }}
					>
						{session && (
							<div className="relative w-full max-w-xs md:max-w-md lg:max-w-lg">
								<div className="flex items-center bg-white dark:bg-gray-700 rounded-lg shadow focus-within:ring-2 focus-within:ring-blue-500 transition">
									<input
										type="text"
										value={searchTerm}
										onChange={handleSearch}
										placeholder="Search tasks..."
										className="w-full py-2 pl-4 rounded-lg focus:outline-none bg-transparent text-gray-800 dark:text-gray-300"
									/>
									<MdSearch
										className="absolute right-2 text-gray-400 dark:text-gray-500"
										size={24}
									/>
								</div>
								{searchResults.length > 0 && (
									<ul className="absolute bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-2 w-full z-10 max-h-60 overflow-y-auto">
										{searchResults.map((result) => (
											<li
												key={result.id}
												onClick={() => handleSearchClick(result.id)}
												className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300"
											>
												{result.title}
											</li>
										))}
									</ul>
								)}
							</div>
						)}

						{/* Dark Mode Toggle */}
						<Switch
							onChange={toggleDarkMode}
							checked={isDarkMode}
							offColor="#888"
							onColor="#000"
							uncheckedIcon={false}
							checkedIcon={false}
							height={16}
							width={32}
						/>
					</div>

					{/* Mobile Menu Toggle */}
					<div className="lg:hidden ml-auto">
						<button
							onClick={toggleMobileMenu}
							className="text-white"
							style={{ WebkitAppRegion: "no-drag" }}
						>
							{isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
						</button>
					</div>

					{/* Mobile Menu */}
					<div
						className={`fixed inset-0 ${
							isElectron ? "bg-indigo-500" : "bg-indigo-500"
						} z-40 flex flex-col items-center justify-center transform transition-transform duration-300 ease-in-out ${
							isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
						} lg:hidden`}
						style={{ WebkitAppRegion: "no-drag" }}
					>
						{isMobileMenuOpen && (
							<button
								onClick={toggleMobileMenu}
								className="absolute top-4 right-4 text-white"
							>
								<MdClose size={24} />
							</button>
						)}

						{session ? (
							<div className="flex flex-col space-y-4">
								<button
									onClick={() => {
										navigate("/profile");
										setIsMobileMenuOpen(false);
									}}
									className="text-white text-xl cursor-pointer hover:text-gray-200"
								>
									Profile
								</button>
								<button
									onClick={() => {
										navigate("/tasks");
										setIsMobileMenuOpen(false);
									}}
									className="text-white text-xl cursor-pointer hover:text-gray-200"
								>
									View Tasks
								</button>
								<button
									onClick={() => {
										onOpenTaskModal();
										setIsMobileMenuOpen(false);
									}}
									className="text-white text-xl cursor-pointer hover:text-gray-200"
								>
									Create Task
								</button>
								<button
									onClick={() => {
										handleLogout();
										setIsMobileMenuOpen(false);
									}}
									className="text-white text-xl cursor-pointer hover:text-gray-200"
								>
									Logout
								</button>
							</div>
						) : (
							<button
								onClick={() => {
									handleLogin();
									setIsMobileMenuOpen(false);
								}}
								className="text-white text-xl cursor-pointer hover:text-gray-200"
							>
								Login
							</button>
						)}
					</div>
				</nav>
			</div>
		</div>
	);
};

export default Navbar;
