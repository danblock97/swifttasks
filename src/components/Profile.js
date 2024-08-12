import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Profile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserProfile = async () => {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				setMessage("Error fetching user details: " + error.message);
			} else {
				setUser(user);
			}
			setLoading(false);
		};

		fetchUserProfile();
	}, []);

	const handleUpdatePassword = async () => {
		setLoading(true);
		const { error } = await supabase.auth.updateUser({ password: newPassword });

		if (error) {
			setMessage("Error updating password: " + error.message);
		} else {
			setMessage(
				"Password updated successfully. You will be logged out to reauthenticate."
			);
			await supabase.auth.signOut(); // Log the user out
			navigate("/auth"); // Redirect to login page
		}
		setLoading(false);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
				<h2 className="text-2xl font-bold text-center">Your Profile</h2>

				{user ? (
					<div>
						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">
								Name
							</label>
							<p className="border border-gray-300 p-2 rounded bg-gray-100">
								{user.user_metadata?.full_name || "N/A"}
							</p>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">
								Email
							</label>
							<p className="border border-gray-300 p-2 rounded bg-gray-100">
								{user.email}
							</p>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">
								Update Password
							</label>
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="New Password"
								className="w-full px-3 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
							<button
								onClick={handleUpdatePassword}
								className="w-full py-2 font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600"
							>
								Update Password
							</button>
						</div>
						{message && <p>{message}</p>}
					</div>
				) : (
					<p>No user details found.</p>
				)}
			</div>
		</div>
	);
};

export default Profile;
