import React, { useEffect, useState, useRef } from "react";
import Switch from "react-switch";
import { useDarkMode } from "../context/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { MdMinimize, MdClose, MdCropSquare } from "react-icons/md";
import { FaCloudDownloadAlt } from "react-icons/fa";

let ipcRenderer;
let remote;

if (
	typeof window !== "undefined" &&
	window.process &&
	window.process.type === "renderer"
) {
	ipcRenderer = window.require("electron").ipcRenderer;
	remote = window.require("@electron/remote");
}

const Navbar = ({ onOpenTaskModal }) => {
	const [session, setSession] = useState(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const { isDarkMode, toggleDarkMode } = useDarkMode();

	useEffect(() => {
		if (ipcRenderer) {
			ipcRenderer.on("update_available", () => {
				setUpdateAvailable(true);
			});

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

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const closeDropdown = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsDropdownOpen(false);
		}
	};

	const handleUpdate = () => {
		if (ipcRenderer) {
			ipcRenderer.send("restart_app");
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", closeDropdown);
		return () => {
			document.removeEventListener("mousedown", closeDropdown);
		};
	}, []);

	return (
		<nav
			className="bg-indigo-500 p-4 shadow-lg flex justify-between items-center select-none"
			style={{ WebkitAppRegion: "drag" }}
			onDoubleClick={handleMaximizeToggle}
		>
			<div className="flex items-center space-x-4">
				<h1
					className="text-white text-2xl font-bold cursor-pointer"
					onClick={() => navigate("/")}
					style={{ WebkitAppRegion: "no-drag" }}
				>
					SwiftTasks
				</h1>
			</div>
			<div
				className="flex items-center space-x-6"
				style={{ WebkitAppRegion: "no-drag" }}
			>
				<Switch
					onChange={toggleDarkMode}
					checked={isDarkMode}
					offColor="#888"
					onColor="#000"
					uncheckedIcon={false}
					checkedIcon={false}
				/>
				{session ? (
					<>
						<button
							onClick={() => navigate("/profile")}
							className="text-white cursor-pointer hover:text-gray-200 bg-transparent border-0 p-0"
						>
							Profile
						</button>
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={toggleDropdown}
								className="text-white cursor-pointer hover:text-gray-200 bg-transparent border-0 p-0"
							>
								Tasks
							</button>
							{isDropdownOpen && (
								<div className="absolute left-0 mt-2 bg-white rounded shadow-lg w-40 z-50">
									<button
										onClick={() => {
											navigate("/tasks");
											setIsDropdownOpen(false);
										}}
										className="block px-4 py-2 text-indigo-500 hover:bg-gray-200 text-left w-full"
									>
										View Tasks
									</button>
									<button
										onClick={() => {
											onOpenTaskModal();
											setIsDropdownOpen(false);
										}}
										className="block px-4 py-2 text-indigo-500 hover:bg-gray-200 text-left w-full"
									>
										Create Task
									</button>
								</div>
							)}
						</div>
						<button
							onClick={handleLogout}
							className="text-white cursor-pointer hover:text-gray-200 bg-transparent border-0 p-0"
						>
							Logout
						</button>
					</>
				) : (
					<button
						onClick={handleLogin}
						className="text-white cursor-pointer hover:text-gray-200 bg-transparent border-0 p-0"
					>
						Login
					</button>
				)}
			</div>
			{updateAvailable && (
				<div
					className="flex items-center space-x-2"
					style={{ WebkitAppRegion: "no-drag" }}
				>
					<button
						onClick={handleUpdate}
						className="w-8 h-8 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 rounded"
						aria-label="Update Available"
					>
						<FaCloudDownloadAlt size={20} />
					</button>
				</div>
			)}
			{remote && (
				<div
					className="flex items-center space-x-2"
					style={{ WebkitAppRegion: "no-drag" }}
				>
					<button
						onClick={handleMinimize}
						className="w-8 h-8 flex items-center justify-center text-white hover:bg-indigo-700 rounded"
						aria-label="Minimize"
					>
						<MdMinimize size={20} />
					</button>
					<button
						onClick={handleMaximizeToggle}
						className="w-8 h-8 flex items-center justify-center text-white hover:bg-indigo-700 rounded"
						aria-label="Maximize"
					>
						<MdCropSquare size={20} />
					</button>
					<button
						onClick={handleClose}
						className="w-8 h-8 flex items-center justify-center text-white hover:bg-red-600 rounded"
						aria-label="Close"
					>
						<MdClose size={20} />
					</button>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
