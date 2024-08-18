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
	MdClose as MdCloseIcon,
} from "react-icons/md";
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
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

	const handleUpdate = () => {
		if (ipcRenderer) {
			ipcRenderer.send("restart_app");
		}
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<nav
			className="bg-indigo-500 p-4 shadow-lg flex justify-between items-center sticky top-0 z-50"
			style={{ WebkitAppRegion: "drag" }} // Enable dragging for the navbar
		>
			{/* Logo and Title on the left */}
			<div
				className="flex items-center"
				style={{ WebkitAppRegion: "no-drag" }} // Prevent dragging on this section
			>
				<h1
					className="text-white text-2xl font-bold cursor-pointer"
					onClick={() => navigate("/")}
				>
					SwiftTasks
				</h1>
			</div>

			{/* Centered Navigation Options */}
			<div
				className="absolute left-1/2 transform -translate-x-1/2"
				style={{ WebkitAppRegion: "no-drag" }} // Prevent dragging on this section
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

			{/* Right section with Switch and window controls */}
			<div
				className="flex items-center space-x-4 ml-auto"
				style={{ WebkitAppRegion: "no-drag" }} // Prevent dragging on this section
			>
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

				{/* Window Control Buttons */}
				{remote && (
					<div className="flex items-center space-x-2">
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
			</div>

			{/* Mobile Menu */}
			<div className="lg:hidden ml-auto">
				<button
					onClick={toggleMobileMenu}
					className="text-white"
					style={{ WebkitAppRegion: "no-drag" }} // Prevent dragging on this button
				>
					{isMobileMenuOpen ? <MdCloseIcon size={24} /> : <MdMenu size={24} />}
				</button>
			</div>

			<div
				className={`fixed inset-0 bg-indigo-500 z-40 flex flex-col items-center justify-center transform transition-transform duration-300 ease-in-out ${
					isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
				} lg:relative lg:translate-x-0 lg:flex lg:flex-row lg:items-center lg:space-x-6`}
				style={{ WebkitAppRegion: "no-drag" }} // Prevent dragging on this section
			>
				{isMobileMenuOpen && (
					<button
						onClick={toggleMobileMenu}
						className="absolute top-4 right-4 text-white"
					>
						<MdCloseIcon size={24} />
					</button>
				)}
			</div>
			{updateAvailable && (
				<div className="lg:flex items-center space-x-2 hidden">
					<button
						onClick={handleUpdate}
						className="w-8 h-8 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 rounded"
						aria-label="Update Available"
					>
						<FaCloudDownloadAlt size={20} />
					</button>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
