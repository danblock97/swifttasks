import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { MdMinimize, MdClose, MdCropSquare } from "react-icons/md"; // Importing icons from react-icons

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
