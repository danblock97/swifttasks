import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { MdMinimize, MdClose, MdCropSquare } from "react-icons/md"; // Importing icons from react-icons

// Conditional import of Electron's remote module
let remote;
if (typeof window !== "undefined" && window.require) {
	remote = window.require("@electron/remote");
}

const Navbar = ({ onOpenTaskModal }) => {
	const [session, setSession] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setSession(null); // Ensure session is cleared on logout
		localStorage.clear(); // Clear any local storage that might hold session data
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

	return (
		<nav
			className="bg-indigo-500 p-4 shadow-lg flex justify-between items-center select-none"
			style={{ WebkitAppRegion: "drag" }} // Makes the entire navbar draggable
			onDoubleClick={handleMaximizeToggle} // Handle double-click to maximize/restore
		>
			<div className="flex items-center space-x-4">
				<h1
					className="text-white text-2xl font-bold cursor-pointer"
					onClick={() => navigate("/")}
					style={{ WebkitAppRegion: "no-drag" }} // Exclude the title from dragging
				>
					SwiftTasks
				</h1>
			</div>
			<div
				className="flex items-center space-x-4"
				style={{ WebkitAppRegion: "no-drag" }}
			>
				{session ? (
					<>
						<button
							onClick={() => navigate("/profile")}
							className="px-4 py-2 text-indigo-500 bg-white font-semibold rounded hover:bg-gray-200"
						>
							Profile
						</button>
						<button
							onClick={onOpenTaskModal}
							className="px-4 py-2 text-indigo-500 bg-white font-semibold rounded hover:bg-gray-200"
						>
							Create Task
						</button>
						<button
							onClick={handleLogout}
							className="px-4 py-2 text-white bg-red-500 font-semibold rounded hover:bg-red-600"
						>
							Logout
						</button>
					</>
				) : (
					<button
						onClick={handleLogin}
						className="px-4 py-2 text-white bg-indigo-500 font-semibold border border-white rounded hover:bg-indigo-600"
					>
						Login
					</button>
				)}
			</div>
			{/* Conditionally render Electron window controls */}
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
