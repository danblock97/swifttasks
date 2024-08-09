import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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
		navigate("/auth");
	};

	const handleLogin = () => {
		navigate("/auth");
	};

	return (
		<nav className="bg-indigo-500 p-4 shadow-lg">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-white text-2xl font-bold">SwiftTasks</h1>
				<div className="flex items-center space-x-4">
					{session && (
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
						</>
					)}
					{session ? (
						<button
							onClick={handleLogout}
							className="px-4 py-2 text-white bg-red-500 font-semibold rounded hover:bg-red-600"
						>
							Logout
						</button>
					) : (
						<button
							onClick={handleLogin}
							className="px-4 py-2 text-white bg-indigo-500 font-semibold border border-white rounded hover:bg-indigo-600"
						>
							Login
						</button>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
